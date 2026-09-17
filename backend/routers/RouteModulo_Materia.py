from database.connection import SessionLocal
from models.materias_modulo_model import *
from Schemas.materias_modulo_schema import *
from services import materias_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

modulo_materia_route = APIRouter(
    prefix="/modulo_materia",
    tags=["Modulos Materias"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@modulo_materia_route.get("/", response_model=List[MateriaModuloEntrada], status_code=status.HTTP_200_OK)
def listar_matemodulos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return materias_modulo_service.listar_materias_por_modulo(db)

@modulo_materia_route.post("/", response_model=MateriaModuloEntrada, status_code=status.HTTP_200_OK)
def mati_gei(modume: MateriaModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.crear_oferta(modume, db)

@modulo_materia_route.patch("/{idmatemo}", response_model=MateriaModuloActualizar)
def update_modulo(idmatemo: int, materiamo: MateriaModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.actualizar_materias_modulo_parcial(idmatemo, materiamo, db)

@modulo_materia_route.delete("/{idmatemo}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idmatemo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.eliminar_materia_modulo(idmatemo, db)