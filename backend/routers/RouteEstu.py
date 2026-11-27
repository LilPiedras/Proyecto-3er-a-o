from typing import List
from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.estudiante_model import *
from models.usuario_model import Usuario
from Schemas.estudiante_schema import EstuEntrada, EstudianteSalida, EstudianteActualizar
from services import estudiante_service
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


@estudiante_router.get("/excel", status_code=status.HTTP_200_OK)
def descargar_nomina_estudiantes_excel(
    incluir_inactivos: bool = False,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1]))
):
    return estudiante_service.exportar_nomina_excel(incluir_inactivos, db)


@estudiante_router.get("/inactivos", response_model=List[EstudianteSalida], status_code=status.HTTP_200_OK)
def listar_estudiantes_inactivos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return estudiante_service.listar_estudiantes_inactivos(db)


@estudiante_router.get("/{ciestu}", response_model=EstudianteSalida)
def obtener_estudiante(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([4, 3, 2, 1]))
):
    return estudiante_service.obtener_estudiante_por_id(ciestu, db)


@estudiante_router.get("/", response_model=List[EstudianteSalida], status_code=status.HTTP_200_OK)
def listar_estudiantes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([5, 4, 3, 2, 1]))
):
    return estudiante_service.listar_estudiantes(db)


@estudiante_router.post("/", response_model=EstuEntrada, status_code=status.HTTP_200_OK)
def crear_estudiante(
    estudiante: EstuEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1]))
):
    return estudiante_service.crear_estudiante(estudiante, current_user.ciuser, db)


@estudiante_router.put("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_completo(
    ciestu: str,
    estu_updata: EstudianteActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1]))
):
    return estudiante_service.actualizar_estudiante_completo(ciestu, estu_updata, current_user.ciuser, db)


@estudiante_router.patch("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_parcial(
    ciestu: str,
    estu_updata: EstudianteActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1]))
):
    return estudiante_service.actualizar_estudiante_parcial(ciestu, estu_updata, current_user.ciuser, db)


@estudiante_router.patch("/{ciestu}/restaurar", response_model=EstudianteSalida)
def restaurar_estudiante_logico(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return estudiante_service.restaurar_estudiante(ciestu, current_user.ciuser, db)


@estudiante_router.delete("/{ciestu}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estudiante_logico(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2]))
):
    return estudiante_service.eliminar_estudiante(ciestu, current_user.ciuser, db)