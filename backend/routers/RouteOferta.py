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

@oferta_router.get("/", response_model=List[OfertaEntrada], status_code=status.HTTP_200_OK)
def listar_ofertas(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return oferta_seccion_service.listar_ofertas(db)

@oferta_router.post("/", response_model=OfertaEntrada, status_code=status.HTTP_200_OK)
def crear_empleado(Ofertin: OfertaEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.crear_oferta(Ofertin, db)

@oferta_router.patch("/{idseccmo}", response_model=OfertaSalida)
def update_oferta_parcial(idseccmo: int, estu_updata: OfertaActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.OfertaActualizar(idseccmo, estu_updata, db)

@oferta_router.delete("/{idseccmo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_oferta_logico(idseccmo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.eliminar_curso(idseccmo, db)
