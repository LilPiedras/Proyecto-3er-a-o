from database.connection import SessionLocal
from models.bloque_model import *
from Schemas.bloque_schema import *
from services import bloque_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

bloque_route = APIRouter(
    prefix="/bloque",
    tags=["Bloques"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@bloque_route.get("/{idbloque}", response_model=BloqueSalida)
def obtener_curso(idbloque: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return bloque_service.obtener_bloque_por_id(idbloque, db)

@bloque_route.get("/", response_model=List[BloqueEntrada], status_code=status.HTTP_200_OK)
def listar_bloque(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return bloque_service.listar_bloques_horarios(db)

@bloque_route.post("/", response_model=BloqueEntrada, status_code=status.HTTP_200_OK)
def crear_bloque(bloque: BloqueEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return bloque_service.crear_bloque(bloque, db)

@bloque_route.put("/{idbloque}", response_model=BloqueSalida)
def updata_bloquecito(idbloque: int, toy_agumon_updata: BloqueEntrada, db: Session = Depends(get_db)
                      , current_user: Usuario = Depends(VerificarRoles([1]))):
    return bloque_service.actualizar_horario_completo(idbloque, toy_agumon_updata, db)

@bloque_route.patch("/{idbloque}", response_model=BloqueSalida)
def updata_bloquecito(idbloque: int, toy_agumon_updata: BloqueActualizar, db: Session = Depends(get_db)
                      , current_user: Usuario = Depends(VerificarRoles([1]))):
    return bloque_service.actualizar_curso_parcial(idbloque, toy_agumon_updata, db)

@bloque_route.delete("/{idbloque}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bloque(idbloque: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return bloque_service.eliminar_bloque(idbloque, db)
