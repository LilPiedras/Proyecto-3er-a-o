from datetime import date
from typing import List

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.usuario_model import Usuario
from Schemas.asistencia_schema import (
    AsistenciaActualizar,
    AsistenciaEntrada,
    AsistenciaEstudianteSalida,
    AsistenciaLoteEntrada,
    AsistenciaLoteSalida,
    AsistenciaMateriaSalida,
    AsistenciaSeccionSalida,
    AsistenciaSalida,
)
from services import asistencia_service
from tokensitos.auth_depencias import VerificarRoles

asistencia_router = APIRouter(prefix="/asistencias", tags=["Asistencias"])
roles_asistencia = VerificarRoles([1, 2, 3, 4])


@asistencia_router.get("/materias", response_model=List[AsistenciaMateriaSalida])
def obtener_materias_asistencia(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.listar_materias(current_user, db)


@asistencia_router.get("/secciones", response_model=List[AsistenciaSeccionSalida])
def obtener_secciones_asistencia(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.listar_secciones(current_user, db)


@asistencia_router.get("/secciones/{idsecc}/materias", response_model=List[AsistenciaMateriaSalida])
def obtener_materias_por_seccion(
    idsecc: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.listar_materias_por_seccion(idsecc, current_user, db)


@asistencia_router.get("/", response_model=List[AsistenciaEstudianteSalida])
def listar_asistencia(
    idmateria: int,
    fecha: date,
    idsecc: int | None = None,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.listar_asistencia_por_materia(
        idmateria, fecha, current_user, db, idsecc
    )


@asistencia_router.post("/lote", response_model=AsistenciaLoteSalida)
def confirmar_asistencia_lote(
    lote: AsistenciaLoteEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.confirmar_asistencia_lote(lote, current_user, db)


@asistencia_router.post("/", response_model=AsistenciaSalida)
def guardar_asistencia(
    asistencia: AsistenciaEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.guardar_asistencia(asistencia, current_user, db)


@asistencia_router.patch("/{idasis}", response_model=AsistenciaSalida)
def actualizar_asistencia(
    idasis: int,
    cambios: AsistenciaActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    return asistencia_service.actualizar_asistencia(idasis, cambios, current_user, db)


@asistencia_router.delete("/{idasis}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_asistencia(
    idasis: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(roles_asistencia),
):
    asistencia_service.eliminar_asistencia(idasis, current_user, db)
    return Response(status_code=status.HTTP_204_NO_CONTENT)