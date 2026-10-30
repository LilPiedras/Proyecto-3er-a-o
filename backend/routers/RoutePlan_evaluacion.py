from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.usuario_model import Usuario
from Schemas.plan_evaluacion_schema import PlanEvaluacionEntrada, PlanEvaluacionSalida
from services import plan_evaluacion_services as evaluacion_service
from tokensitos.auth_depencias import VerificarRoles

plan_evaluacion_router = APIRouter(
    prefix="/plan-evaluacion",
    tags=["Plan de Evaluación"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@plan_evaluacion_router.get("/", response_model=List[PlanEvaluacionSalida])
def listar_todos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))):
    return evaluacion_service.listar_todas_evaluaciones(db)

@plan_evaluacion_router.post("/", response_model=PlanEvaluacionSalida, status_code=status.HTTP_201_CREATED)
def crear_evaluacion(eval_in: PlanEvaluacionEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2]))):
    return evaluacion_service.crear_plan_evaluacion(eval_in, current_user.ciuser, db)

@plan_evaluacion_router.get("/materia/{idmateria}", response_model=List[PlanEvaluacionSalida])
def obtener_evaluaciones_materia(idmateria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))):
    return evaluacion_service.listar_evaluaciones_por_materia(idmateria, db)

@plan_evaluacion_router.delete("/{idevaluacion}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_evaluacion(idevaluacion: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2]))):
    return evaluacion_service.eliminar_evaluacion(idevaluacion, db)