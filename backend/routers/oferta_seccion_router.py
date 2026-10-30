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
def listar_ofertas_disponibles(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4]))):
    return oferta_seccion_service.listar_ofertas(db)

@oferta_router.post("/", response_model=OfertaSalida, status_code=status.HTTP_201_CREATED)
def crear_oferta(ofertin: OfertaEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))):
    return oferta_seccion_service.crear_oferta(ofertin, db)

@oferta_router.delete("/{idseccmo}", status_code=status.HTTP_204_NO_CONTENT)
def delete_oferta(idseccmo: int, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.eliminar_oferta(idseccmo, db)

@oferta_router.patch("/{idseccmo}/asignar-estudiante", response_model=OfertaSalida)
def asignar_estudiante(idseccmo: int, data: AsignarEstudiante, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2]))):
    return oferta_seccion_service.asignar_estudiante_a_oferta(idseccmo, data.ciestu, db)

@oferta_router.patch("/{idseccmo}/desasignar-estudiante", response_model=OfertaSalida)
def desasignar_estudiante(idseccmo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return oferta_seccion_service.desasignar_estudiante(idseccmo, db)

@oferta_router.get("/estudiante/{ciestu}", response_model=List[OfertaSalida])
def ver_ofertas_del_estudiante(ciestu: str, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))):
    return oferta_seccion_service.obtener_oferta_estudiante(ciestu, db)