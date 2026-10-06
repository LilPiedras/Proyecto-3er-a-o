from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.usuario_model import Usuario
from Schemas.materias_chema import MateriasSalida, MateriasEntrada, MateriasActualizar
from services import materias_service
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
def obtener_mati(
    idmateria: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([4, 2, 1]))
):
    return materias_service.obtener_materia_por_id(idmateria, db)

@materia_route.get("/", response_model=List[MateriasSalida], status_code=status.HTTP_200_OK)
def listar_matis(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([4, 2, 1]))
):
    return materias_service.listar_materias_horarios(db)

@materia_route.post("/", response_model=MateriasSalida, status_code=status.HTTP_201_CREATED)
def crear_materia(
    materia: MateriasEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return materias_service.crear_materia(materia, db)

@materia_route.put("/{idmateria}", response_model=MateriasSalida)
def updata_materia(
    idmateria: int,
    materia_data: MateriasEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return materias_service.actualizar_completo(idmateria, materia_data, db)

@materia_route.patch("/{idmateria}", response_model=MateriasSalida)
def update_materi(
    idmateria: int,
    materia_data: MateriasActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return materias_service.actualizar_materia_parcial(idmateria, materia_data, db)

@materia_route.delete("/{idmateria}", status_code=status.HTTP_204_NO_CONTENT)
def delete(
    idmateria: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return materias_service.eliminar_materia(idmateria, db)
