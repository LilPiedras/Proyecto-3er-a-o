from database.connection import SessionLocal
from models.modulo_model import *
from Schemas.modulo_schema import *
from services import modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

modulo_route = APIRouter(
    prefix="/modulo",
    tags=["Modulos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@modulo_route.get("/{idmodulo}", response_model=ModuloSalida)
def obtener_mati(idmodulo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return modulo_service.obtener_modulo_por_id(idmodulo, db)

@modulo_route.get("/", response_model=List[ModuloEntrada], status_code=status.HTTP_200_OK)
def listar_modulos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,3,2,1]))):
    return modulo_service.listar_modulo(db)

@modulo_route.post("/", response_model=ModuloEntrada, status_code=status.HTTP_200_OK)
def mati_gei(modu: ModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return modulo_service.crear_modulo(modu, db)

@modulo_route.put("/{idmodulo}", response_model=ModuloSalida)
def updata_modulos(idmodulo: int, mati_gei: ModuloEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return modulo_service.actualizar__completo(idmodulo, mati_gei, db)

@modulo_route.patch("/{idmodulo}", response_model=ModuloEntrada)
def update_modulo(idmodulo: int, ale_gay: ModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return modulo_service.actualizar_modulo_parcial(idmodulo, ale_gay, db)

@modulo_route.delete("/{idmodulo}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idmodulo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return modulo_service.eliminar_modulo(idmodulo, db)
