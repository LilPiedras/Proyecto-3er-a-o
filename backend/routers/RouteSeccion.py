from database.connection import SessionLocal
from models.seccion_model import *
from Schemas.seccion_schema import *
from services import seccion_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

seccion_router = APIRouter(
    prefix="/seccion",
    tags=["Secciones"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@seccion_router.get("/", response_model=List[SeccionSalida], status_code=status.HTTP_200_OK)
def listar_secciones(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,3,2,1]))):
    return seccion_service.listar_secciones(db)

@seccion_router.post("/", response_model=SeccionEntrada, status_code=status.HTTP_200_OK)
def crear_secciones(secc: SeccionEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return seccion_service.crear_seccion(secc, db)

@seccion_router.patch("/{idsecc}", response_model=SeccionSalida)
def update_seccion_parcial(idsecc: int, secc_updata: SeccionActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return seccion_service.actualizar_seccion_parcial(idsecc, secc_updata, db)
