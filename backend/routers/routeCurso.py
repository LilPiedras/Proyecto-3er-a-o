from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from Schemas.curso_schema import CursoEntrada, CursoActualizar, CursoSalida
from services import curso_service
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

curso_route = APIRouter(
    prefix="/curso",
    tags=["Cursos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@curso_route.get("/", response_model=List[CursoSalida], status_code=status.HTTP_200_OK)
def listar_cursos(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([4, 3, 2, 1]))
):
    return curso_service.listar_curso(db)

@curso_route.post("/", response_model=CursoSalida, status_code=status.HTTP_201_CREATED)
def crear_curso(
    curso: CursoEntrada, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return curso_service.crear_curso(curso, db)

@curso_route.put("/{idcurso}", response_model=CursoSalida)
def actualizar_curso_completo(
    idcurso: int, 
    cur_updata: CursoActualizar, # 👈 Cambiado a CursoActualizar para permitir actualizaciones flexibles
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    return curso_service.actualizar_curso_completo(idcurso, cur_updata, db)

@curso_route.delete("/{idcurso}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_curso_logico(
    idcurso: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1]))
):
    curso_service.eliminar_curso(idcurso, db)
    return None