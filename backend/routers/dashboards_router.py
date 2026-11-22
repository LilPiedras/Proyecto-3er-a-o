from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.usuario_model import Usuario
from Schemas.dashboard_schema import DashboardResumenResponse
from services import dashboards_services
from tokensitos.auth_depencias import VerificarRoles

dashboard_router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@dashboard_router.get("/resumen", response_model=DashboardResumenResponse, status_code=status.HTTP_200_OK)
def obtener_resumen_dashboard(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3]))
):
    return dashboards_services.obtener_resumen_dashboard(db, current_user)