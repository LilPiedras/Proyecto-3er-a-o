from database.connection import SessionLocal
from models.asignacion_docente_model import *
from Schemas.asignacion_docente_schema import *
from services import asignacion_docente_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

Asig_route = APIRouter(
    prefix="/asignacion_docente",
    tags=["Asignacion Docente"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@Asig_route.get("/{id_asignacion_docente}", response_model=AsigmentDocSalida)
def obtener_curso(id_asignacion_docente: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return asignacion_docente_service.obtener_asignacion_de_materia_por_id(id_asignacion_docente, db)

@Asig_route.get("/", response_model=List[AsigmentDocSalida], status_code=status.HTTP_200_OK)
def listar_docentes(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,2,1]))):
    return asignacion_docente_service.listar_docentes_asignados(db)

@Asig_route.post("/", response_model=AsigmentDocEntrada, status_code=status.HTTP_200_OK)
def crear_empleado(asig: AsigmentDocEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return asignacion_docente_service.crear_nueva_asignacion(asig, db)

@Asig_route.put("/{id_asignacion_docente}", response_model=AsigmentDocSalida)
def update_empleado_completo(id_asignacion_docente: int, asig_updata: AsigmentDocEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return asignacion_docente_service.actualizar_asignaciones_completo(id_asignacion_docente, asig_updata, db)

@Asig_route.patch("/{id_asignacion_docente}", response_model=AsigmentDocSalida)
def update_asignacion_parcial(id_asignacion_docente: int, asig_up: AsigmentDocUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return asignacion_docente_service.actualizar_horario_parcial(id_asignacion_docente, asig_up, db)

@Asig_route.delete("/{id_asignacion_docente}", status_code=status.HTTP_204_NO_CONTENT)
def dele_asog_logico(id_asignacion_docente: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return asignacion_docente_service.eliminar_asig(id_asignacion_docente, db)
