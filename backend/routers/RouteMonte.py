from database.connection import SessionLocal
from models.mensualidad_model import *
from Schemas.mensualidad_schema import *
from services import mensualidad_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

mensualidad_route = APIRouter(
    prefix="/mensualidad",
    tags=["Mensualidad"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@mensualidad_route.get("/{idmensualidad}", response_model=MensualidadSalida)
def obtener_men(idmensualidad: int, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.obtener_mensualidad_por_id(idmensualidad, db)

@mensualidad_route.get("/", response_model=List[MensualidadSalida], status_code=status.HTTP_200_OK)
def listar_mensualidad(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.listar_mensualidades(db)

@mensualidad_route.post("/", response_model=MensualidadEntrada, status_code=status.HTTP_200_OK)
def mati_gei(mensualidad: MensualidadEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.crear_mensualidad(mensualidad, db)

@mensualidad_route.patch("/{idmensualidad}", response_model=MensualidadEntrada)
def update_mensualidad(idmensualidad: int, ale_gay: MensualidadActualizar, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.actualizar_mensualidad_parcial(idmensualidad, ale_gay, db)

