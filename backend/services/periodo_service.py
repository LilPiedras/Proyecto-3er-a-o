from models.periodo_model import Periodo
from Schemas.periodo_schema import *
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def obtener_periodo_id(id: int, db: Session):
    periodo = db.query(Periodo).filter(Periodo.id == id, Periodo.activo == True).first()
    if periodo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Periodo no encontrado")
    return periodo


def listar_periodos(db: Session):
    return db.query(Periodo).filter(Periodo.activo == True).all()


def crear_periodo(periodo: PeriodoEntrada, db: Session):
    try:
        periodo = Periodo(
            nombre = periodo.nombre,
            fecha_inicio=periodo.fecha_inicio,
            fecha_fin=periodo.fecha_fin,
            activo=True
        )
        db.add(periodo)
        db.commit()
        db.refresh(periodo)
        return periodo
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear el periodo. Verifique que los datos asignados sean válidos"
        )


def actualizar_periodo_completo(id: int, clockmon: PeriodoEntrada, db: Session):
    db_periodo = db.query(Periodo).filter(Periodo.id == id).first()
    if not db_periodo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Periodo no encontrado")

    for key, value in clockmon.model_dump(exclude_unset=True).items():
        setattr(db_periodo, key, value)

    db.commit()
    db.refresh(db_periodo)
    return db_periodo


def actualizar_periodo_parcial(id: int, clockmon: PeriodoActualizar, db: Session):
    db_periodo = db.query(Periodo).filter(Periodo.id == id, Periodo.activo == True).first()
    if not db_periodo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

    update_data = clockmon.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_periodo, key, value)

    db.commit()
    db.refresh(db_periodo)
    return db_periodo


def eliminar_periodo(id: int, db: Session):
    db_periodo = db.query(Periodo).filter(Periodo.id == id, Periodo.activo == True).first()
    if not db_periodo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Periodo no encontrado")

    db_periodo.activo = False
    db.commit()
    return None