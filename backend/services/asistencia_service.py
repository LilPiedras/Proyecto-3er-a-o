from datetime import date
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.asistencia_model import Asistencias
from models.carrera_modulo_model import Carrera_Modulo
from models.estudiante_model import Estudiante
from models.materias_model import Materias
from models.materias_modulo_model import Materias_Modulo
from models.oferta_seccion_model import Oferta_seccion
from models.seccion_model import Seccion
from models.usuario_model import Usuario
from Schemas.asistencia_schema import (
    AsistenciaActualizar,
    AsistenciaEntrada,
    AsistenciaLoteEntrada,
)


def _verificar_materia(idmateria: int, usuario: Usuario, db: Session) -> Materias:
    materia = db.query(Materias).filter(
        Materias.idmateria == idmateria,
        Materias.activo.is_(True),
    ).first()
    if materia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La materia no existe o está inactiva")

    if usuario.login_data.idrol == 4 and (
        not usuario.empleado or materia.docente != usuario.empleado
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Solo puedes gestionar la asistencia de tus materias asignadas",
        )
    return materia


def _estudiante_inscrito(idmateria: int, asisestu: str, db: Session) -> bool:
    inscripcion = (
        db.query(Estudiante.ciestu)
        .join(Oferta_seccion, Oferta_seccion.estudiante == Estudiante.ciestu)
        .join(Carrera_Modulo, Carrera_Modulo.idcarremo == Oferta_seccion.idcarremo)
        .join(Materias_Modulo, Materias_Modulo.idmatemo == Carrera_Modulo.idmatemo)
        .filter(
            Estudiante.ciestu == asisestu,
            Estudiante.activo.is_(True),
            Materias_Modulo.idmateria == idmateria,
        )
        .first()
    )
    return inscripcion is not None


def listar_materias(usuario: Usuario, db: Session):
    query = (
        db.query(Materias.idmateria, Materias.nombremateria)
        .join(Materias_Modulo, Materias_Modulo.idmateria == Materias.idmateria)
        .join(Carrera_Modulo, Carrera_Modulo.idmatemo == Materias_Modulo.idmatemo)
        .join(Oferta_seccion, Oferta_seccion.idcarremo == Carrera_Modulo.idcarremo)
        .join(Estudiante, Estudiante.ciestu == Oferta_seccion.estudiante)
        .filter(Materias.activo.is_(True), Estudiante.activo.is_(True))
    )
    if usuario.login_data.idrol == 4:
        if not usuario.empleado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario docente no tiene un empleado vinculado",
            )
        query = query.filter(Materias.docente == usuario.empleado)

    return [
        {"idmateria": row.idmateria, "nombremateria": row.nombremateria}
        for row in query.distinct().order_by(Materias.nombremateria).all()
    ]


def listar_secciones(usuario: Usuario, db: Session):
    query = (
        db.query(Seccion.idsecc, Seccion.nomsecc)
        .join(Oferta_seccion, Oferta_seccion.idsecc == Seccion.idsecc)
        .join(Carrera_Modulo, Carrera_Modulo.idcarremo == Oferta_seccion.idcarremo)
        .join(Materias_Modulo, Materias_Modulo.idmatemo == Carrera_Modulo.idmatemo)
        .join(Materias, Materias.idmateria == Materias_Modulo.idmateria)
        .join(Estudiante, Estudiante.ciestu == Oferta_seccion.estudiante)
        .filter(Materias.activo.is_(True), Estudiante.activo.is_(True))
    )
    if usuario.login_data.idrol == 4:
        if not usuario.empleado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario docente no tiene un empleado vinculado",
            )
        query = query.filter(Materias.docente == usuario.empleado)

    return [
        {"idsecc": row.idsecc, "nomsecc": row.nomsecc}
        for row in query.distinct().order_by(Seccion.nomsecc).all()
    ]


def listar_materias_por_seccion(idsecc: int, usuario: Usuario, db: Session):
    query = (
        db.query(Materias.idmateria, Materias.nombremateria)
        .join(Materias_Modulo, Materias_Modulo.idmateria == Materias.idmateria)
        .join(Carrera_Modulo, Carrera_Modulo.idmatemo == Materias_Modulo.idmatemo)
        .join(Oferta_seccion, Oferta_seccion.idcarremo == Carrera_Modulo.idcarremo)
        .join(Estudiante, Estudiante.ciestu == Oferta_seccion.estudiante)
        .filter(
            Oferta_seccion.idsecc == idsecc,
            Materias.activo.is_(True),
            Estudiante.activo.is_(True),
        )
    )
    if usuario.login_data.idrol == 4:
        if not usuario.empleado:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="El usuario docente no tiene un empleado vinculado",
            )
        query = query.filter(Materias.docente == usuario.empleado)

    return [
        {"idmateria": row.idmateria, "nombremateria": row.nombremateria}
        for row in query.distinct().order_by(Materias.nombremateria).all()
    ]


def listar_asistencia_por_materia(
    idmateria: int,
    fecha_consulta: date,
    usuario: Usuario,
    db: Session,
    idsecc: Optional[int] = None,
):
    _verificar_materia(idmateria, usuario, db)
    query = (
        db.query(
            Asistencias.idasis,
            Estudiante.ciestu.label("asisestu"),
            Estudiante.nombreestu,
            Estudiante.apelliestu,
            Asistencias.verificar,
        )
        .select_from(Estudiante)
        .join(Oferta_seccion, Oferta_seccion.estudiante == Estudiante.ciestu)
        .join(Carrera_Modulo, Carrera_Modulo.idcarremo == Oferta_seccion.idcarremo)
        .join(Materias_Modulo, Materias_Modulo.idmatemo == Carrera_Modulo.idmatemo)
        .outerjoin(
            Asistencias,
            and_(
                Asistencias.asisestu == Estudiante.ciestu,
                Asistencias.idmateria == idmateria,
                Asistencias.fecha == fecha_consulta,
            ),
        )
        .filter(
            Materias_Modulo.idmateria == idmateria,
            Estudiante.activo.is_(True),
        )
    )
    if idsecc is not None:
        query = query.filter(Oferta_seccion.idsecc == idsecc)
    filas = query.distinct().order_by(Estudiante.apelliestu, Estudiante.nombreestu).all()
    return [
        {
            "idasis": fila.idasis,
            "asisestu": fila.asisestu,
            "nombreestu": fila.nombreestu,
            "apelliestu": fila.apelliestu,
            "idmateria": idmateria,
            "fecha": fecha_consulta,
            "verificar": fila.verificar,
        }
        for fila in filas
    ]


def guardar_asistencia(asistencia_in: AsistenciaEntrada, usuario: Usuario, db: Session):
    _verificar_materia(asistencia_in.idmateria, usuario, db)
    if not _estudiante_inscrito(asistencia_in.idmateria, asistencia_in.asisestu, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estudiante no está inscrito en esta materia",
        )

    asistencia = db.query(Asistencias).filter(
        Asistencias.asisestu == asistencia_in.asisestu,
        Asistencias.idmateria == asistencia_in.idmateria,
        Asistencias.fecha == asistencia_in.fecha,
    ).first()
    if asistencia is None:
        asistencia = Asistencias(
            asisestu=asistencia_in.asisestu,
            idmateria=asistencia_in.idmateria,
            fecha=asistencia_in.fecha,
            verificar=asistencia_in.verificar,
        )
        db.add(asistencia)
    else:
        asistencia.verificar = asistencia_in.verificar

    db.commit()
    db.refresh(asistencia)
    return asistencia


def confirmar_asistencia_lote(
    lote: AsistenciaLoteEntrada,
    usuario: Usuario,
    db: Session,
):
    _verificar_materia(lote.idmateria, usuario, db)
    estudiantes = [
        fila[0]
        for fila in (
            db.query(Estudiante.ciestu)
            .join(Oferta_seccion, Oferta_seccion.estudiante == Estudiante.ciestu)
            .join(Carrera_Modulo, Carrera_Modulo.idcarremo == Oferta_seccion.idcarremo)
            .join(Materias_Modulo, Materias_Modulo.idmatemo == Carrera_Modulo.idmatemo)
            .filter(
                Oferta_seccion.idsecc == lote.idsecc,
                Materias_Modulo.idmateria == lote.idmateria,
                Estudiante.activo.is_(True),
            )
            .distinct()
            .all()
        )
    ]
    if not estudiantes:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay estudiantes inscritos en esta sección y materia",
        )

    marcas_solicitadas = {marca.asisestu: marca.verificar for marca in lote.asistencias}
    if len(marcas_solicitadas) != len(lote.asistencias) or set(marcas_solicitadas) != set(estudiantes):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="La lista de estudiantes cambió. Recarga la asistencia e inténtalo de nuevo.",
        )

    registros = db.query(Asistencias).filter(
        Asistencias.idmateria == lote.idmateria,
        Asistencias.fecha == lote.fecha,
        Asistencias.asisestu.in_(estudiantes),
    ).all()
    registros_por_estudiante = {registro.asisestu: registro for registro in registros}

    for ci_estudiante in estudiantes:
        registro = registros_por_estudiante.get(ci_estudiante)
        if registro is None:
            db.add(Asistencias(
                asisestu=ci_estudiante,
                idmateria=lote.idmateria,
                fecha=lote.fecha,
                verificar=marcas_solicitadas[ci_estudiante],
            ))
        else:
            registro.verificar = marcas_solicitadas[ci_estudiante]

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudieron guardar todas las asistencias; vuelve a cargar la lista e inténtalo de nuevo",
        ) from error

    return {"actualizadas": len(estudiantes)}


def actualizar_asistencia(
    idasis: int,
    cambios: AsistenciaActualizar,
    usuario: Usuario,
    db: Session,
):
    asistencia = db.query(Asistencias).filter(Asistencias.idasis == idasis).first()
    if asistencia is None or asistencia.idmateria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La asistencia no existe o no tiene materia asociada",
        )
    _verificar_materia(asistencia.idmateria, usuario, db)
    if not _estudiante_inscrito(asistencia.idmateria, asistencia.asisestu, db):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El estudiante ya no está inscrito en esta materia",
        )

    asistencia.verificar = cambios.verificar
    db.commit()
    db.refresh(asistencia)
    return asistencia


def eliminar_asistencia(idasis: int, usuario: Usuario, db: Session) -> None:
    asistencia = db.query(Asistencias).filter(Asistencias.idasis == idasis).first()
    if asistencia is None or asistencia.idmateria is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La asistencia no existe o no tiene materia asociada",
        )
    _verificar_materia(asistencia.idmateria, usuario, db)
    db.delete(asistencia)
    db.commit()