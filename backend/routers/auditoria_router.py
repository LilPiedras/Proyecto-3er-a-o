from typing import List, Optional

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from Schemas.auditoria_esquema import AuditoriaSalida
from database.connection import SessionLocal
from models.usuario_model import Usuario
from services import auditoria_service
from tokensitos.auth_depencias import VerificarRoles

auditoria_router = APIRouter(
    prefix="/auditoria",
    tags=["Auditorias"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@auditoria_router.get("/", response_model=List[AuditoriaSalida], status_code=status.HTTP_200_OK)
def listar_auditorias(
    mes: Optional[int] = Query(default=None, ge=1, le=12),
    dia: Optional[int] = Query(default=None, ge=1, le=31),
    hora: Optional[int] = Query(default=None, ge=0, le=23),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])),
):
    return auditoria_service.listar_auditorias(db, mes=mes, dia=dia, hora=hora)


@auditoria_router.get("/pdf", status_code=status.HTTP_200_OK)
def exportar_auditorias_pdf(
    mes: Optional[int] = Query(default=None, ge=1, le=12),
    dia: Optional[int] = Query(default=None, ge=1, le=31),
    hora: Optional[int] = Query(default=None, ge=0, le=23),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])),
):
    pdf_bytes = auditoria_service.obtener_pdf_auditorias(db, mes=mes, dia=dia, hora=hora)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": 'attachment; filename="reporte_auditorias.pdf"'
        },
    )


@auditoria_router.get("/excel", status_code=status.HTTP_200_OK)
def exportar_auditorias_excel(
    mes: Optional[int] = Query(default=None, ge=1, le=12),
    dia: Optional[int] = Query(default=None, ge=1, le=31),
    hora: Optional[int] = Query(default=None, ge=0, le=23),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])),
):
    excel_bytes = auditoria_service.obtener_excel_auditorias(db, mes=mes, dia=dia, hora=hora)
    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": 'attachment; filename="reporte_auditorias.xlsx"'
        },
    )


@auditoria_router.get("/{idseria}", response_model=AuditoriaSalida)
def obtener_auditoria(
    idseria: int,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3])),
):
    return auditoria_service.obtener_auditoria_por_id(idseria, db)