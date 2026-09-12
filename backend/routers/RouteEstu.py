from database.connection import SessionLocal
from models.estudiante_model import *
from Schemas.estudiante_schema import EstuEntrada, EstudianteSalida, EstudianteActualizar
from services import estudiante_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

estudiante_router = APIRouter(
    prefix="/estudiantes",
    tags=["Estudiantes"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@estudiante_router.get("/{ciestu}", response_model=EstudianteSalida)
def obtener_estudiante(ciestu: str, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1])) ):
    return estudiante_service.obtener_estudiante_por_id(ciestu, db)

@estudiante_router.get("/", response_model=List[EstudianteSalida], status_code=status.HTTP_200_OK)
def listar_estudiantes(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return estudiante_service.listar_estudiantes(db)

@estudiante_router.post("/", response_model=EstuEntrada, status_code=status.HTTP_200_OK)
def crear_empleado(estudiante: EstuEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return estudiante_service.crear_estudiante(estudiante, db)

@estudiante_router.put("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_completo(ciestu: str, estu_updata: EstudianteActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return estudiante_service.actualizar_estudiante_completo(ciestu, estu_updata, db, )

@estudiante_router.patch("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_parcial(ciestu: str, estu_updata: EstudianteActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return estudiante_service.actualizar_estudiante_parcial(ciestu, estu_updata, db)

@estudiante_router.delete("/{ciestu}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estudiante_logico(ciestu: str, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return estudiante_service.eliminar_estudiante(ciestu, db)
