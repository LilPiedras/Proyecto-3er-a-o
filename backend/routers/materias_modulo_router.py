from database.connection import SessionLocal
from models.materias_modulo_model import *
from Schemas.materias_modulo_schema import *
from services import materias_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

oferta_router = APIRouter(
    prefix="/Materias Modulo",
    tags=["Materias Modulo"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@oferta_router.get("/", response_model=List[MateriaModuloSalida], status_code=status.HTTP_200_OK)
def listar_ofertas_disponibles(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.listar_materias_por_modulo(db)

@oferta_router.post("/", response_model=MateriaModuloEntrada, status_code=status.HTTP_200_OK)
def crear_oferta(materin: MateriaModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.crear_oferta(materin, db)

@oferta_router.delete("/{idmatemo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_oferta(idmatemo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.eliminar_materia_modulo(idmatemo, db)
