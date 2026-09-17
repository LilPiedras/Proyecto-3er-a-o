from database.connection import SessionLocal
from models.empleado_model import *
from Schemas.empleado_schema import EmpleadoEntrada, EmpleadoSalida, EmpleadoUpdate
from services import empleado_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

empleado_router = APIRouter(
    prefix="/empleado",
    tags=["Empleados"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@empleado_router.get("/{ciempleado}", response_model=EmpleadoSalida)
def obtener_empleado(ciempleado: str, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.obtener_empleado_por_id(ciempleado, db)

@empleado_router.get("/", response_model=List[EmpleadoSalida], status_code=status.HTTP_200_OK)
def listar_empleados(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.listar_empleados(db)

@empleado_router.post("/", response_model=EmpleadoEntrada, status_code=status.HTTP_200_OK)
def crear_empleado(empleado: EmpleadoEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.crear_empleado(empleado, db)

@empleado_router.put("/{ciempleado}", response_model=EmpleadoSalida)
def update_empleado_completo(ciempleado: str, emple_update: EmpleadoEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.actualizar_empleado_completo(ciempleado, emple_update, db, )

@empleado_router.patch("/{ciempleado}", response_model=EmpleadoSalida)
def update_empleado_parcial(ciempleado: str, empleado_update: EmpleadoUpdate, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.actualizar_empleado_parcial(ciempleado, empleado_update, db)

@empleado_router.delete("/{ciempleado}", status_code=status.HTTP_204_NO_CONTENT)
def delete_empleado_logico(ciempleado: str, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return empleado_service.eliminar_empleado(ciempleado, db)
