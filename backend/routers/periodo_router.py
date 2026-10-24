from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from Schemas.periodo_schema import *
from services import periodo_service
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

periodo_router = APIRouter(
    prefix="/periodo",
    tags=["Periodo"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@periodo_router.get("/", response_model=List[PeriodoSalida], status_code=status.HTTP_200_OK)
def listar_periodos(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([5 ,4, 3, 2, 1]))
):
    return periodo_service.listar_periodos(db)

@periodo_router.post("/", response_model=PeriodoSalida, status_code=status.HTTP_201_CREATED)
def crear_periodo(
    periodo: PeriodoEntrada, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    return periodo_service.crear_periodo(periodo, db)

@periodo_router.put("/{id}", response_model=PeriodoSalida)
def actualizar_periodo(
    id: int, 
    cur_updata: PeriodoActualizar,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    return periodo_service.actualizar_periodo_completo(id, cur_updata, db)

@periodo_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_curso_logico(
    idcurso: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1,2,3]))
):
    periodo_service.eliminar_periodo(id, db)
    return None