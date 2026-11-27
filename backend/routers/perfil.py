from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import get_db
from models.usuario_model import Usuario
from services import perfil_services
from tokensitos.auth_depencias import VerificarRoles

perfil_router = APIRouter(prefix="/api/perfil", tags=["Perfil"])


@perfil_router.get("/", status_code=status.HTTP_200_OK)
def obtener_perfil_usuario(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4, 5])),
):
    return perfil_services.obtener_perfil_usuario(current_user, db)