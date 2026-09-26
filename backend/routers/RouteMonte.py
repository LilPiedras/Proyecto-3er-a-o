from database.connection import SessionLocal
from models.mensualidad_model import *
from Schemas.mensualidad_schema import *
from services import mensualidad_service
from sqlalchemy.orm import Session
from sqlalchemy import text  # 👈 Importante: agregar esta importación
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 
from models.usuario_model import Usuario

mensualidad_route = APIRouter(
    prefix="/mensualidad",
    tags=["Mensualidad"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- ENDPOINT DE ESTUDIANTES MOROSOS (VISTA SQL) ---
@mensualidad_route.get("/morosos", status_code=status.HTTP_200_OK)
def obtener_estudiantes_morosos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1])) # Permiso solo para administradores
):
    query = text("SELECT * FROM public.v_estudiantes_morosos;")
    resultado = db.execute(query)
    morosos = [dict(row._mapping) for row in resultado]
    return morosos

# --- RESTO DE ENDPOINTS DE MENSUALIDAD ---
@mensualidad_route.get("/{idmensualidad}", response_model=MensualidadSalida)
def obtener_men(idmensualidad: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.obtener_mensualidad_por_id(idmensualidad, db)

@mensualidad_route.get("/", response_model=List[MensualidadSalida], status_code=status.HTTP_200_OK)
def listar_mensualidad(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.listar_mensualidades(db)

@mensualidad_route.post("/", response_model=MensualidadSalida, status_code=status.HTTP_201_CREATED)
def crear_mensualidad(mensualidad: MensualidadEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.crear_mensualidad(mensualidad, db)

@mensualidad_route.patch("/{idmensualidad}", response_model=MensualidadSalida)
def update_mensualidad(idmensualidad: int, mensualidad_up: MensualidadActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return mensualidad_service.actualizar_mensualidad_parcial(idmensualidad, mensualidad_up, db)