from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models.periodo_model import Periodo

def obtener_periodo_activo(db: Session) -> Periodo:
    periodo = db.query(Periodo).filter(Periodo.activo == True).first()
    if not periodo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay un periodo académico activo"
        )
    return periodo

def validar_periodo_abierto(db: Session):
    periodo = obtener_periodo_activo(db)

    if periodo.cerrado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"El periodo '{periodo.nombre}' está cerrado. No se permiten modificaciones en notas, asistencias ni plan de evaluación."
        )
    return periodo