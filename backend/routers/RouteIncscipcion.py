from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from Schemas.inscripcion_schema import (
    InscripcionActualizar,
    InscripcionCrear,
    InscripcionReemplazo,
    InscripcionSalida,
)
from services import inscripcion_service
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

inscripcion_router = APIRouter(
    prefix="/inscipcion",
    tags=["Inscripcion"]
)
inscripcion_alias_router = APIRouter(
    prefix="/inscripcion",
    tags=["Inscripcion"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 1. LISTAR TODAS LAS INSCRIPCIONES ACTIVAS
@inscripcion_alias_router.get("/", response_model=List[InscripcionSalida], status_code=status.HTTP_200_OK, include_in_schema=False)
@inscripcion_router.get("/", response_model=List[InscripcionSalida], status_code=status.HTTP_200_OK)
def listar_inscripciones(
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([5, 4, 3, 2, 1]))
):
    return inscripcion_service.listar_inscripciones(db)

# 2. OBTENER UNA INSCRIPCIÓN POR SU ID
@inscripcion_alias_router.get("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK, include_in_schema=False)
@inscripcion_router.get("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK)
def obtener_inscripcion_por_id(
    id: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([5, 4, 3, 2, 1]))
):
    return inscripcion_service.obtener_inscripcion_id(id, db)

# 3. CREAR INSCRIPCIÓN COMPLETA (Valida fechas del período, notas del módulo anterior, crea detalle y asigna oferta)
@inscripcion_alias_router.post("/", response_model=InscripcionSalida, status_code=status.HTTP_201_CREATED, include_in_schema=False)
@inscripcion_router.post("/", response_model=InscripcionSalida, status_code=status.HTTP_201_CREATED)
def crear_inscripcion_completa(
    payload: InscripcionCrear,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))
):
    return inscripcion_service.crear_inscripcion_completa(payload, db)

# 4. ACTUALIZAR COMPLETO (PUT)
@inscripcion_alias_router.put("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK, include_in_schema=False)
@inscripcion_router.put("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK)
def actualizar_inscripcion_completa(
    id: int, 
    cur_updata: InscripcionReemplazo,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))
):
    return inscripcion_service.actualizar_inscripcion_completo(id, cur_updata, db)

# 5. ACTUALIZAR PARCIAL (PATCH)
@inscripcion_alias_router.patch("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK, include_in_schema=False)
@inscripcion_router.patch("/{id}", response_model=InscripcionSalida, status_code=status.HTTP_200_OK)
def actualizar_inscripcion_parcial(
    id: int, 
    cur_updata: InscripcionActualizar,
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))
):
    return inscripcion_service.actualizar_inscripcion_parcial(id, cur_updata, db)

# 6. ELIMINAR / ANULAR (BORRADO LÓGICO)
@inscripcion_alias_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, include_in_schema=False)
@inscripcion_router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_inscripcion_logico(
    id: int, 
    db: Session = Depends(get_db), 
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))
):
    inscripcion_service.eliminar_inscripcion(id, db)
    return None