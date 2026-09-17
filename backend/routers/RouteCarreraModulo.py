from database.connection import SessionLocal
from models.carrera_modulo_model import *
from Schemas.carrera_modulo_schema import *
from services import carrera_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

modulo_carrera_route = APIRouter(
    prefix="/Carrera_Modulo",
    tags=["Carrera Modulos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@modulo_carrera_route.get("/", response_model=List[CarreraModuloEntrada], status_code=status.HTTP_200_OK)
def listar_matemodulos(db: Session = Depends(get_db),current_user: Usuario = Depends(VerificarRoles([4,2,1,3])) ):
    return carrera_modulo_service.listar_carreras_horarios(db)

@modulo_carrera_route.post("/", response_model=CarreraModuloEntrada, status_code=status.HTTP_200_OK)
def mati_gei(carremo: CarreraModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4]))):
    return carrera_modulo_service.crear_carrera(carremo, db)

@modulo_carrera_route.patch("/{idcarremo}", response_model=CarreraModuloActualizar)
def update_modulo(idcarremo: int, carremou: CarreraModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4]))):
    return carrera_modulo_service.actualizar_materia_parcial(idcarremo, carremou, db)

@modulo_carrera_route.delete("/{idcarremo}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idcarremo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4]))):
    return carrera_modulo_service.eliminar_materia(idcarremo, db)