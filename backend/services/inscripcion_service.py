from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from Schemas.inscripcion_schema import (
    InscripcionActualizar,
    InscripcionCrear,
    InscripcionReemplazo,
)
from models.detalle_inscripcion_model import Detalle_Inscripcion
from models.estudiante_model import Estudiante
from models.inscripcion_model import Inscripcion
from models.periodo_model import Periodo
from models.seccion_model import Seccion


def _obtener_periodo_abierto(periodo_id: int, db: Session, hoy: date) -> Periodo:
    periodo = db.query(Periodo).filter(
        Periodo.id == periodo_id,
        Periodo.activo.is_(True),
    ).first()
    if periodo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El período académico no existe o está inactivo.",
        )
    if (
        (periodo.fecha_inicio is not None and hoy < periodo.fecha_inicio)
        or (periodo.fecha_fin is not None and hoy > periodo.fecha_fin)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El período académico está fuera de su ventana de inscripción.",
        )
    return periodo


def _validar_estudiante(ciestu: str, db: Session) -> Estudiante:
    estudiante = db.query(Estudiante).filter(
        Estudiante.ciestu == ciestu,
        Estudiante.activo.is_(True),
    ).first()
    if estudiante is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El estudiante no existe o está inactivo.",
        )
    return estudiante


def crear_inscripcion_completa(data: InscripcionCrear, db: Session) -> Inscripcion:
    hoy = date.today()
    _validar_estudiante(data.ciestu, db)
    _obtener_periodo_abierto(data.periodo_id, db, hoy)

    secciones = db.query(Seccion).filter(
        Seccion.idsecc.in_(data.secciones_solicitadas)
    ).all()
    secciones_encontradas = {seccion.idsecc for seccion in secciones}
    if secciones_encontradas != set(data.secciones_solicitadas):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Una o más secciones no existen.",
        )

    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.ciestu == data.ciestu,
        Inscripcion.periodo_id == data.periodo_id,
        Inscripcion.activo.is_(True),
    ).options(selectinload(Inscripcion.detalles)).first()

    try:
        if inscripcion is None:
            inscripcion = Inscripcion(
                ciestu=data.ciestu,
                periodo_id=data.periodo_id,
                fecha_inscripcion=hoy,
                estado=data.estado,
                activo=True,
            )
            db.add(inscripcion)
            db.flush()

        secciones_ya_inscritas = {
            detalle.seccion_id
            for detalle in inscripcion.detalles
            if detalle.activo
        }
        repetidas = secciones_ya_inscritas.intersection(data.secciones_solicitadas)
        if repetidas:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"El estudiante ya está inscrito en la(s) sección(es): {', '.join(map(str, sorted(repetidas)))}.",
            )

        inscripcion.detalles.extend(
            Detalle_Inscripcion(seccion_id=seccion_id, activo=True)
            for seccion_id in data.secciones_solicitadas
        )
        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La inscripción ya existe o fue registrada simultáneamente. Actualice la lista e intente de nuevo.",
        ) from error

    return obtener_inscripcion_id(inscripcion.id, db)


def obtener_inscripcion_id(id: int, db: Session) -> Inscripcion:
    inscripcion = db.query(Inscripcion).options(
        selectinload(Inscripcion.detalles).selectinload(Detalle_Inscripcion.seccion_rel)
    ).filter(
        Inscripcion.id == id,
        Inscripcion.activo.is_(True),
    ).first()
    if inscripcion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada.",
        )
    return inscripcion


def listar_inscripciones(db: Session) -> list[Inscripcion]:
    return db.query(Inscripcion).options(
        selectinload(Inscripcion.detalles).selectinload(Detalle_Inscripcion.seccion_rel)
    ).filter(
        Inscripcion.activo.is_(True)
    ).all()


def _actualizar_inscripcion(
    id: int,
    datos: InscripcionActualizar | InscripcionReemplazo,
    db: Session,
) -> Inscripcion:
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.id == id,
        Inscripcion.activo.is_(True),
    ).first()
    if inscripcion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada.",
        )

    cambios = datos.model_dump(exclude_unset=True)
    ciestu = cambios.get("ciestu", inscripcion.ciestu)
    periodo_id = cambios.get("periodo_id", inscripcion.periodo_id)
    if ciestu is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La inscripción debe estar asociada a un estudiante.",
        )

    _validar_estudiante(ciestu, db)
    if "periodo_id" in cambios:
        _obtener_periodo_abierto(periodo_id, db, date.today())
    duplicada = db.query(Inscripcion.id).filter(
        Inscripcion.ciestu == ciestu,
        Inscripcion.periodo_id == periodo_id,
        Inscripcion.activo.is_(True),
        Inscripcion.id != id,
    ).first()
    if duplicada:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El estudiante ya tiene una inscripción activa para ese período.",
        )

    for campo, valor in cambios.items():
        setattr(inscripcion, campo, valor)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La inscripción entra en conflicto con otra inscripción activa.",
        ) from error
    return obtener_inscripcion_id(id, db)


def actualizar_inscripcion_completo(
    id: int,
    datos: InscripcionReemplazo,
    db: Session,
) -> Inscripcion:
    return _actualizar_inscripcion(id, datos, db)


def actualizar_inscripcion_parcial(
    id: int,
    datos: InscripcionActualizar,
    db: Session,
) -> Inscripcion:
    return _actualizar_inscripcion(id, datos, db)


def eliminar_inscripcion(id: int, db: Session) -> None:
    inscripcion = db.query(Inscripcion).options(
        selectinload(Inscripcion.detalles)
    ).filter(
        Inscripcion.id == id,
        Inscripcion.activo.is_(True),
    ).first()
    if inscripcion is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inscripción no encontrada.",
        )

    inscripcion.activo = False
    for detalle in inscripcion.detalles:
        detalle.activo = False

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo anular la inscripción.",
        ) from error
