from database.connection import SessionLocal
from models.carrera_model import *
from Schemas.carrera_schema import *
from services import carrera_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

carrera_route = APIRouter(
    prefix="/Carrera",
    tags=["Carrera"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@carrera_route.get("/", response_model=List[CarreraEntrada], status_code=status.HTTP_200_OK)
def listar_carreras(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,3,2,1]))):
    return carrera_service.listar_carrera(db)

@carrera_route.post("/", response_model=CarreraEntrada, status_code=status.HTTP_200_OK)
def mati_gei(modume: CarreraEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return carrera_service.crear_bloque(modume, db)

@carrera_route.patch("/{idcarrera}", response_model=CarreraUpdata)
def update_modulo(idcarrera: int, materiamo: CarreraUpdata, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return carrera_service.actualizar_carrera_parcial(idcarrera, materiamo, db)

@carrera_route.delete("/{idcarrera}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idcarrera: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return carrera_service.eliminar_carrera(idcarrera, db)