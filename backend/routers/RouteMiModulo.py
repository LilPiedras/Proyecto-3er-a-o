from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles
from services.mi_modulo_service import obtener_mi_modulo

mi_modulo_router = APIRouter(
    prefix="/estudiante",
    tags=["Mi Módulo (Estudiante)"],
)

@mi_modulo_router.get("/mi-modulo", status_code=status.HTTP_200_OK, summary="Módulo, materias, horario y notas del estudiante logueado")
def mi_modulo(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4, 5]))):
    return obtener_mi_modulo(current_user, db)