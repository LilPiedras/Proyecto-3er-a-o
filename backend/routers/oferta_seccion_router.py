from database.connection import SessionLocal
from models.oferta_seccion_model import *
from Schemas.oferta_seccion_schema import *
from services import oferta_seccion_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

oferta_router = APIRouter(
    prefix="/Oferta",
    tags=["Oferta Academica"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@oferta_router.get("/", response_model=List[OfertaSalida], status_code=status.HTTP_200_OK)
def listar_ofertas_disponibles(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.listar_ofertas(db)

@oferta_router.post("/", response_model=OfertaEntrada, status_code=status.HTTP_200_OK)
def crear_oferta(ofertin: OfertaEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.crear_oferta(ofertin, db)

@oferta_router.delete("/{idseccmo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_oferta(idseccmo: int, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.eliminar_curso(idseccmo, db)
