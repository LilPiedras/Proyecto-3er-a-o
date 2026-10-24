from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from Schemas.detalle_inscripcion_schema import *
from services import detalles_inscripcion_service
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

detalle_router = APIRouter(
    prefix="/detalle",
    tags=["Detalle"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@detalle_router.get("/", response_model=List[Detalle_InscripcionSalidad], status_code=status.HTTP_200_OK)
def listar_detalles_inscripcion(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([5 ,4, 3, 2, 1]))
):
    return detalles_inscripcion_service.listar_detalles(db)

@detalle_router.post("/", response_model=Detalle_InscripcionSalidad, status_code=status.HTTP_201_CREATED)
def crear_detalle_inscripcion(
    detalle: Detalle_InscripcionEntrada, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    return detalles_inscripcion_service.crear_detalle(detalle, db)

@detalle_router.put("/{id}", response_model=Detalle_InscripcionSalidad)
def actualizar_detalle(
    id: int, 
    detalle_updata: Detalle_InscripcionActualizar,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    return detalles_inscripcion_service.actualizar_detalle_parcial(id, detalle_updata, db)

@detalle_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_curso_logico(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    detalles_inscripcion_service.eliminar_detalle(id, db)
    return None