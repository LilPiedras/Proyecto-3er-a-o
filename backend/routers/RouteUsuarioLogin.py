from database.connection import SessionLocal
from models.user_login_model import *
from Schemas.usuario_login_schema import *
from services import usuario_login_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from tokensitos.auth_depencias import VerificarRoles
from models.usuario_model import Usuario

usuariolog_router = APIRouter(
    prefix="/usuario_login",
    tags=["Usuarios Logeados"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@usuariolog_router.post("/", response_model=Login_UserEntrada, status_code=status.HTTP_200_OK)
def crear_usuario_log(usuario: Login_UserEntrada, db:Session = Depends(get_db),current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_login_service.crear_login(usuario, db)

@usuariolog_router.patch("/{ciuser_log}", response_model=Login_UserSalida)
def update_usuario_parcial(ciuser_log: int, usuario_updata: Login_UserActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_login_service.actualizar_roles_parcial(ciuser_log, usuario_updata, db)

@usuariolog_router.delete("/{ciuser_log}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario_logico(ciuser_log: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_login_service.eliminar_usuario(ciuser_log, db)
