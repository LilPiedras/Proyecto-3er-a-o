from datetime import date
from typing import List
from sqlalchemy import text

from fastapi import APIRouter, Depends, Response, status, Query
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

# (Asegúrate de registrarlo en tu router de asistencias o equivalente)
@asistencia_router.get("/Asistencias/estudiante/{ci}")
def obtener_asistencias_estudiante(
    ci: str, 
    idmateria: int = Query(...), 
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT 
            a.idasistencia,
            a.fecha,
            a.estado,
            a.observacion
        FROM public.asistencia a
        WHERE a.estudiante = :ci AND a.idmateria = :idmateria
        ORDER BY a.fecha DESC
    """)
    
    # Nota: Ajusta los nombres de las tablas y columnas (como a.estudiante, a.idmateria, a.estado) 
    # exactamente a como los tengas nombrados en tu base de datos de PostgreSQL.
    resultado = db.execute(query, {"ci": ci, "idmateria": idmateria}).fetchall()

    asistencias = []
    for row in resultado:
        asistencias.append({
            "idasistencia": row[0],
            "fecha": str(row[1]),
            "estado": row[2],       # Puede ser booleano, string ("Presente"/"Ausente"), etc.
            "observacion": row[3]
        })

    return asistencias