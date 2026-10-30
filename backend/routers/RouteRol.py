from database.connection import SessionLocal
from models.rol_model import *
from Schemas.roles_schema import *
from services import roles_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

rol_route = APIRouter(
    prefix="/ Rol",
    tags=["Roles de Usuario"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@rol_route.get("/", response_model=List[RolSalida], status_code=status.HTTP_200_OK)
def listar_roles(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return roles_service.listar_roles(db)

@rol_route.post("/", response_model=RolEntrada, status_code=status.HTTP_200_OK)
def crear_rolplay(rolplay: RolEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return roles_service.crear_roles(rolplay, db)

@rol_route.patch("/{idrol}", response_model=RolSalida)
def updata_rolplay(idrol: int, rolplay: Rolactualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return roles_service.actualizar_roles_parcial(idrol, rolplay, db)

@rol_route.delete("/{idrol}", status_code=status.HTTP_204_NO_CONTENT)
def delete_roles_logico(idrol: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return roles_service.eliminar_rol(idrol, db)