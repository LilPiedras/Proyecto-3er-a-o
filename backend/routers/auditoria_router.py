from database.connection import SessionLocal
from models.auditoria_model import *
from Schemas.auditoria_esquema import AuditoriaEntrada, AuditoriaSalida
from services import auditoria_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

auditoria_router = APIRouter(
    prefix="/auditoria",
    tags=["Auditorias"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@auditoria_router.get("/", response_model=List[AuditoriaSalida], status_code=status.HTTP_200_OK)
def listar_ofertas_disponibles(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return auditoria_service.listar_auditorias(db)


@auditoria_router.get("/{idseria}", response_model=AuditoriaSalida)
def obtener_auditoria(idseria: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return auditoria_service.obtener_auditoria_por_id(idseria, db)


