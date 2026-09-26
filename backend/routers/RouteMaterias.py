from database.connection import SessionLocal
from models.materias_model import *
from Schemas.materias_chema import *
from services import materias_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

materia_route = APIRouter(
    prefix="/materia",
    tags=["Materias"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@materia_route.get("/{idmateria}", response_model=MateriasSalida)
def obtener_mati(idmateria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return materias_service.obtener_materia_por_id(idmateria, db)

@materia_route.get("/", response_model=List[MateriasEntrada], status_code=status.HTTP_200_OK)
def listar_matis(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return materias_service.listar_materias_horarios(db)

@materia_route.post("/", response_model=MateriasEntrada, status_code=status.HTTP_200_OK)
def mati_gei(materia: MateriasEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_service.crear_materia(materia, db)

@materia_route.put("/{idmateria}", response_model=MateriasSalida)
def updata_materia(idmateria: int, mati_gei: MateriasEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_service.actualizar__completo(idmateria, mati_gei, db)

@materia_route.patch("/{idmateria}", response_model=MateriasSalida)
def update_materi(idmateria: int, mati_gay: MateriasActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_service.actualizar_materia_parcial(idmateria, mati_gay, db)

@materia_route.delete("/{idmateria}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idmateria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_service.eliminar_materia(idmateria)

