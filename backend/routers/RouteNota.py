from database.connection import SessionLocal
from models.notas_model import *
from Schemas.notas_schema import *
from services import notas_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles   

notas_route = APIRouter(
    prefix="/Notas",
    tags=["Notas"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@notas_route.get("/{idnota}", response_model=NotasSalida)
def obtener_notas(
    idnota: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])) 
):
    return notas_service.obtener_notas_por_id(idnota, db)

@notas_route.get("/", response_model=List[NotasSalida], status_code=status.HTTP_200_OK)
def listar_nota(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])) 
):
    return notas_service.listar_notas(db)


#CREAR NOTAS: Solo Docentes y Administradores
@notas_route.post("/", response_model=NotasEntrada, status_code=status.HTTP_200_OK)
def crear_notas(
    notas: NotasEntrada, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2])) # <-- Bloquea estudiantes
):
    return notas_service.crear_curso(notas, db)


@notas_route.put("/{idnota}", response_model=NotasSalida)
def update_notas_completo(
    idnota: int, 
    nota_up: NotaActualizar, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return notas_service.actualizar_nota_completo(idnota, nota_up, db)


@notas_route.patch("/{idnota}", response_model=NotasSalida)
def update_notas_parcial(
    idnota: int, 
    nita_up: NotaActualizar, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return notas_service.actualizar_nota_parcial(idnota, nita_up, db)


@notas_route.delete("/{idnota}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notas_logico(
    idnota: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return notas_service.eliminar_nota(idnota, db)