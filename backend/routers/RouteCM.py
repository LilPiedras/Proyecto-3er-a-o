from database.connection import SessionLocal
from models.curso_modulo_model import *
from Schemas.curso_modulo_schema import *
from services import curso_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

curso_m_route = APIRouter(
    prefix="/curso_modulo",
    tags=["Cursos Modulos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@curso_m_route.get("/{idcurso_modulo}", response_model=CursoModuloEntrada)
def obtener_curso(idcurso_modulo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1])) ):
    return curso_modulo_service.obtener_curso_modulo_por_id(idcurso_modulo, db)

@curso_m_route.get("/", response_model=List[CursoModuloSalida], status_code=status.HTTP_200_OK)
def listar_cursos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1,3]))):
    return curso_modulo_service.listar_curso_modulos(db)

@curso_m_route.post("/", response_model=CursoModuloEntrada, status_code=status.HTTP_200_OK)
def crear_cursomodulo(cursom: CursoModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return curso_modulo_service.crear_curso_modulololo(cursom, db)

@curso_m_route.put("/{idcurso_modulo}", response_model=CursoModuloSalida)
def update_empleado_completo(idcurso_modulo: int, cur_updata: CursoModuloEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return curso_modulo_service.actualizar_culomodular_completo(idcurso_modulo, cur_updata, db)

@curso_m_route.patch("/{idcurso_modulo}", response_model=CursoModuloSalida)
def update_curso_parcial(idcurso_modulo: int, curso_updata: CursoModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return curso_modulo_service.actualizar_cursor_parcial(idcurso_modulo, curso_updata, db)

@curso_m_route.delete("/{idcurso_modulo}", status_code=status.HTTP_204_NO_CONTENT)
def dele_curso_logico(idcurso_modulo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return curso_modulo_service.eliminar_curso_modulo(idcurso_modulo, db)
