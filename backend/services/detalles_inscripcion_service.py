from models.detalle_inscripcion_model import Detalle_Inscripcion
from Schemas.detalle_inscripcion_schema import *
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException
from datetime import date
from models.inscripcion_model import Inscripcion
from models.estudiante_model import Estudiante
from models.periodo_model import Periodo
from models.seccion_model import Seccion


def _validar_relaciones(inscripcion_id: int, seccion_id: int, db: Session):
    inscripcion = db.query(Inscripcion).filter(
        Inscripcion.id == inscripcion_id,
        Inscripcion.activo.is_(True),
    ).first()
    if inscripcion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inscripción activa no encontrada")

    estudiante = db.query(Estudiante).filter(
        Estudiante.ciestu == inscripcion.ciestu,
        Estudiante.activo.is_(True),
    ).first()
    if estudiante is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no existe o está inactivo")

    periodo = db.query(Periodo).filter(
        Periodo.id == inscripcion.periodo_id,
        Periodo.activo.is_(True),
    ).first()
    hoy = date.today()
    if periodo is None or (
        (periodo.fecha_inicio is not None and hoy < periodo.fecha_inicio)
        or (periodo.fecha_fin is not None and hoy > periodo.fecha_fin)
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El período académico está cerrado")

    seccion = db.query(Seccion).filter(Seccion.idsecc == seccion_id).first()
    if seccion is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La sección no existe")
    return inscripcion

def obtener_detalles_inscripcion_por_id(id: int, db: Session):
    detallesin = db.query(Detalle_Inscripcion).filter(Detalle_Inscripcion.id == id, Detalle_Inscripcion.activo == True).first()
    if detallesin is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Detalles de la inscripcion no encontrada")
    return detallesin

def listar_detalles(db: Session):
    detallesin = db.query(Detalle_Inscripcion).filter(Detalle_Inscripcion.activo == True).all()
    if not detallesin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de detalles vacía")
    return detallesin

def crear_detalle(detallo: Detalle_InscripcionEntrada, db: Session):
    _validar_relaciones(detallo.inscripcion_periodo_id, detallo.seccion_id, db)
    existente = db.query(Detalle_Inscripcion).filter(
        Detalle_Inscripcion.inscripcion_periodo_id == detallo.inscripcion_periodo_id,
        Detalle_Inscripcion.seccion_id == detallo.seccion_id,
        Detalle_Inscripcion.activo.is_(True),
    ).first()
    if existente:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La sección ya está inscrita")

    detallin = Detalle_Inscripcion(
        inscripcion_periodo_id=detallo.inscripcion_periodo_id, 
        seccion_id = detallo.seccion_id,
        activo=True
    )
    db.add(detallin)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La sección ya está inscrita") from error
    db.refresh(detallin)
    return detallin

def actualizar_completo(id: int, detallo: Detalle_InscripcionEntrada, db: Session):
    db_detalle = db.query(Detalle_Inscripcion).filter(Detalle_Inscripcion.id == id).first()
    if not db_detalle:
        raise HTTPException(status_code=404, detail="El módulo no existe")

    for key, value in detallo.model_dump(exclude_unset=True).items():
        setattr(db_detalle, key, value)

    db.commit()
    db.refresh(db_detalle)
    return db_detalle

def actualizar_detalle_parcial(id: int, detallo: Detalle_InscripcionActualizar, db: Session):
    db_detalle = db.query(Detalle_Inscripcion).filter(
        Detalle_Inscripcion.id == id,
        Detalle_Inscripcion.activo.is_(True),
    ).first()
    if not db_detalle:
        raise HTTPException(status_code=404, detail="El detalle no fue encontrado")

    update_data = detallo.model_dump(exclude_unset=True)
    inscripcion_id = update_data.get("inscripcion_periodo_id", db_detalle.inscripcion_periodo_id)
    seccion_id = update_data.get("seccion_id", db_detalle.seccion_id)
    _validar_relaciones(inscripcion_id, seccion_id, db)
    duplicado = db.query(Detalle_Inscripcion.id).filter(
        Detalle_Inscripcion.inscripcion_periodo_id == inscripcion_id,
        Detalle_Inscripcion.seccion_id == seccion_id,
        Detalle_Inscripcion.activo.is_(True),
        Detalle_Inscripcion.id != id,
    ).first()
    if duplicado:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La sección ya está inscrita")

    for key, value in update_data.items():
        setattr(db_detalle, key, value)

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="La sección ya está inscrita") from error
    db.refresh(db_detalle)
    return db_detalle

def eliminar_detalle(id: int, db: Session):
    db_detallo = db.query(Detalle_Inscripcion).filter(Detalle_Inscripcion.id == id, Detalle_Inscripcion.activo == True).first()
    if not db_detallo:
        raise HTTPException(status_code=404, detail="El detalle no fue encontrado")

    db_detallo.activo = False
    db.commit()
    return None