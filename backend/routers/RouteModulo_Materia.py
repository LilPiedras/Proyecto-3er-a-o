
from database.connection import SessionLocal
from models.materias_modulo_model import Materias_Modulo
from Schemas.materias_modulo_schema import *
from services import materias_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 
from fpdf import FPDF
from datetime import datetime

modulo_materia_route = APIRouter(
    prefix="/modulo_materia",
    tags=["Modulos Materias"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Clase generadora del PDF para el reporte del Módulo
class PDFModuloReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(251, 191, 36)
        self.cell(0, 10, "ACADEMIA AMADA FASHION", 0, 1, "C")
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Reporte de Materias por Módulo Académico", 0, 1, "C")
        self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Página {self.page_no()}", 0, 0, "C")


@modulo_materia_route.get("/", response_model=List[MateriaModuloSalida], status_code=status.HTTP_200_OK)
def listar_matemodulos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,3,2,1]))):
    return materias_modulo_service.listar_materias_por_modulo(db)

@modulo_materia_route.post("/", response_model=MateriaModuloSalida, status_code=status.HTTP_201_CREATED)
def crear_oferta(materin: MateriaModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.crear_oferta(materin, db)

@modulo_materia_route.patch("/{idmatemo}", response_model=MateriaModuloActualizar)
def update_modulo(idmatemo: int, materiamo: MateriaModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.actualizar_materias_modulo_parcial(idmatemo, materiamo, db)

@modulo_materia_route.delete("/{idmatemo}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idmatemo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.eliminar_materia_modulo(idmatemo, db)

@modulo_materia_route.get("/{idmodulo}/exportar-pdf", status_code=status.HTTP_200_OK)
def exportar_pdf_modulo(idmodulo: int, db: Session = Depends(get_db)):
    relaciones = db.query(Materias_Modulo).filter(Materias_Modulo.idmodulo == idmodulo).all()
    
    pdf = PDFModuloReport(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()
    
    pdf.set_text_color(35, 35, 35)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Fecha de emisión: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1, "R")
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, f"Reporte del Módulo #{idmodulo}", 0, 1)
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(31, 41, 55)
    pdf.set_text_color(255, 255, 255)
    
    pdf.cell(20, 8, "ID Rel.", border=1, align="C", fill=True)
    pdf.cell(30, 8, "ID Materia", border=1, align="C", fill=True)
    pdf.cell(140, 8, "Estado / Asignación", border=1, align="L", fill=True)
    pdf.ln()

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(35, 35, 35)

    if not relaciones:
        pdf.cell(190, 10, "No hay materias registradas en este módulo.", border=1, align="C")
    else:
        for rel in relaciones:
            pdf.cell(20, 8, str(rel.idmatemo), border=1, align="C")
            pdf.cell(30, 8, str(rel.idmateria), border=1, align="C")
            pdf.cell(140, 8, "Activa en el módulo", border=1, align="L")
            pdf.ln()

    pdf_bytes = bytes(pdf.output())
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reporte_modulo_{idmodulo}.pdf"}
    )

@modulo_materia_route.get("/", response_model=List[MateriaModuloSalida], status_code=status.HTTP_200_OK)
def listar_matemodulos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([4,3,2,1]))):
    return materias_modulo_service.listar_materias_por_modulo(db)

@modulo_materia_route.post("/", response_model=MateriaModuloSalida, status_code=status.HTTP_201_CREATED)
def crear_oferta(materin: MateriaModuloEntrada, db:Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.crear_oferta(materin, db)


@modulo_materia_route.patch("/{idmatemo}", response_model=MateriaModuloActualizar)
def update_modulo(idmatemo: int, materiamo: MateriaModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.actualizar_materias_modulo_parcial(idmatemo, materiamo, db)

@modulo_materia_route.delete("/{idmatemo}", status_code=status.HTTP_204_NO_CONTENT)
def delete(idmatemo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return materias_modulo_service.eliminar_materia_modulo(idmatemo, db)