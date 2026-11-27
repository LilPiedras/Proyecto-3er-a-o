from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.connection import get_db
from Schemas.horario_oferta_schema import AsignacionSchema
from services import horarios_oferta_services

hrouter = APIRouter(
    prefix="/api",
    tags=["Horarios y Oferta"]
)


@hrouter.get("/horarios-materias")
def obtener_horarios_materias(db: Session = Depends(get_db)):
    return horarios_oferta_services.obtener_horarios_materias(db)


@hrouter.post("/asignar-horario")
def asignar_horario_materia(datos: AsignacionSchema, db: Session = Depends(get_db)):
    return horarios_oferta_services.asignar_horario_materia(datos, db)