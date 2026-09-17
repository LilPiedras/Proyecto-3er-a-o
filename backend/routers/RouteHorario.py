from database.connection import SessionLocal
from models.horarios_model import *
from Schemas.horario_schema import *
from services import horario_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

horario_route = APIRouter(
    prefix="/horarios",
    tags=["Horarios"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@horario_route.get("/{idhorario}", response_model=HorarioSalida)
def obtener_horario(idhorario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1,3,4, 2]))):
    return horario_service.obtener_horario_por_id(idhorario, db)

@horario_route.get("/", response_model=List[HorarioSalida], status_code=status.HTTP_200_OK)
def listar_los_horarios(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 3, 4, 2]))):
    return horario_service.listar_horarios(db)

@horario_route.post("/", response_model=HorarioEntrada, status_code=status.HTTP_200_OK)
def crear_horario(horario: HorarioEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4, 2]))):
    return horario_service.crear_estudiante(horario, db)

@horario_route.put("/{idhorario}", response_model=HorarioSalida)
def update_horario_completo(idhorario: int, horario_updata: HorarioActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4, 2]))):
    return horario_service.actualizar_horario_completo(idhorario, horario_updata, db)

@horario_route.patch("/{idhorario}", response_model=HorarioSalida)
def update_horario_parcial(idhorario: int, horario_up: HorarioActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4, 2]))):
    return horario_service.actualizar_horario_parcial(idhorario, horario_up, db)

@horario_route.delete("/{idhorario}", status_code=status.HTTP_204_NO_CONTENT)
def delete_horario_logico(idhorario: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4, 2]))):
    return horario_service.eliminar_horario(idhorario, db)
