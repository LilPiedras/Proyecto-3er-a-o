from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.plan_evaluacion_model import PlanEvaluacion
from models.materias_model import Materias
from models.asignacion_docente_model import Asignacion_Docente
from Schemas.plan_evaluacion_schema import PlanEvaluacionEntrada
from services.validaciones_periodo import validar_periodo_abierto

def crear_plan_evaluacion(eval_in: PlanEvaluacionEntrada, ci_usuario: str, db: Session):
    validar_periodo_abierto(db)
    materia = (db.query(Materias).filter(Materias.idmateria == eval_in.idmateria, Materias.activo.is_(True)).first())

    if not materia:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La materia indicada no existe o está inactiva",
        )

    if materia.docente and str(materia.docente).strip() != str(ci_usuario).strip():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No eres el docente asignado a esta materia",
        )

    nuevo = PlanEvaluacion(
        idmateria=eval_in.idmateria,
        idsecc=eval_in.idsecc,
        titulo=eval_in.titulo,
        porcentaje=eval_in.porcentaje,
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

def listar_evaluaciones_por_materia(idmateria: int, db: Session):
    evaluaciones = db.query(PlanEvaluacion).filter(PlanEvaluacion.idmateria == idmateria).all()

    if not evaluaciones:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No hay planes de evaluación para esta materia"
        )
    return evaluaciones


def listar_todas_evaluaciones(db: Session):
    return db.query(PlanEvaluacion).all()


def obtener_evaluacion_por_id(idevaluacion: int, db: Session):
    evaluacion = db.query(PlanEvaluacion).filter(PlanEvaluacion.idevaluacion == idevaluacion).first()

    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de evaluación no encontrado"
        )
    return evaluacion

def eliminar_evaluacion(idevaluacion: int, db: Session):
    validar_periodo_abierto(db)
    evaluacion = db.query(PlanEvaluacion).filter(PlanEvaluacion.idevaluacion == idevaluacion).first()

    if not evaluacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan de evaluación no encontrado"
        )

    db.delete(evaluacion)
    db.commit()
    return None