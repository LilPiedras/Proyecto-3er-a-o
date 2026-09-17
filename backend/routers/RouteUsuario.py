from database.connection import SessionLocal
from models.usuario_model import *
from Schemas.usuario_schema import UsuarioEntrada, UsuarioSalida, UsuarioUpdata
from services import usuario_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

usuario_router = APIRouter(
    prefix="/usuario",
    tags=["Usuarios"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@usuario_router.get("/{ciuser}", response_model=UsuarioSalida)
def obtener_usuario(ciuser: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_service.obtener_usuario_por_id(ciuser, db)

@usuario_router.get("/", response_model=List[UsuarioSalida], status_code=status.HTTP_200_OK)
def listar_usuarios(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_service.listar_usuario(db)

@usuario_router.post("/", response_model=UsuarioEntrada, status_code=status.HTTP_200_OK)
def crear_usuario(usuario: UsuarioEntrada, db:Session = Depends(get_db),current_user: Usuario = Depends(VerificarRoles([1])) ):
    return usuario_service.registrar_usuario(usuario, db)

@usuario_router.put("/{ciuser}", response_model=UsuarioSalida)
def update_usuario_completo(ciuser: str, usuario_updata: UsuarioUpdata, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_service.actualizar_usuario_completo(ciuser, usuario_updata, db)

@usuario_router.patch("/{ciuser}", response_model=UsuarioSalida)
def update_usuario_parcial(ciuser: str, usuario_updata: UsuarioUpdata, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_service.actualizar_usuario_parcial(ciuser, usuario_updata, db)

@usuario_router.delete("/{ciuser}", status_code=status.HTTP_204_NO_CONTENT)
def delete_usuario_logico(ciuser: str, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return usuario_service.eliminar_usuario(ciuser, db)
