from database.connection import SessionLocal
from models.carrera_modulo_model import Carrera_Modulo
from models.carrera_model import Carrera
from models.materias_modulo_model import Materias_Modulo  # Nombre real de tu modelo o tabla intermedia
from models.materias_model import Materias                # Modelo real de Materia
from models.modulo_model import Modulo                  # Modelo real de Modulo
from Schemas.carrera_modulo_schema import *
from services import carrera_modulo_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from fastapi.responses import Response
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 
from fpdf import FPDF
from datetime import datetime

modulo_carrera_route = APIRouter(
    prefix="/Carrera_Modulo",
    tags=["Carrera Modulos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Clase generadora del PDF para el reporte de Carrera-Módulo
class PDFCarreraReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(251, 191, 36)
        self.cell(0, 10, "ACADEMIA AMADA FASHION", 0, 1, "C")
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Reporte de Materias-Módulo por Carrera", 0, 1, "C")
        self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Página {self.page_no()}", 0, 0, "C")


@modulo_carrera_route.get("/", response_model=List[CarreraModuloSalida], status_code=status.HTTP_200_OK)
def listar_carrera_modulos(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4]))):
    return carrera_modulo_service.listar_carrera_modulos(db)

@modulo_carrera_route.post("/", response_model=CarreraModuloSalida, status_code=status.HTTP_201_CREATED)
def crear_carrera_modulo(carremo: CarreraModuloEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 3]))):
    return carrera_modulo_service.crear_carrera_modulo(carremo, db)

@modulo_carrera_route.patch("/{idcarremo}", response_model=CarreraModuloSalida)
def actualizar_carrera_modulo(idcarremo: int, carremou: CarreraModuloActualizar, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 3]))):
    return carrera_modulo_service.actualizar_carrera_modulo_parcial(idcarremo, carremou, db)

@modulo_carrera_route.delete("/{idcarremo}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_carrera_modulo(idcarremo: int, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 3]))):
    return carrera_modulo_service.eliminar_carrera_modulo(idcarremo, db)

@modulo_carrera_route.get("/{idcarrera}/exportar-pdf", status_code=status.HTTP_200_OK)
def exportar_pdf_carrera(idcarrera: int, db: Session = Depends(get_db)):
    # 1. Obtener el nombre de la carrera
    carrera = db.query(Carrera).filter(Carrera.idcarrera == idcarrera).first()
    nombre_carrera = carrera.nombrecarrera if carrera else f"Carrera #{idcarrera}"

    # 2. Consultar uniendo Carrera_Modulo con MateriaModulo, Materia y Modulo para extraer los nombres reales
    resultados = (
        db.query(Carrera_Modulo, Materias, Modulo)
        .join(Materias_Modulo, Carrera_Modulo.idmatemo == Materias_Modulo.idmatemo)
        .join(Materias, Materias_Modulo.idmateria == Materias.idmateria)
        .join(Modulo, Materias_Modulo.idmodulo == Modulo.idmodulo)
        .filter(Carrera_Modulo.idcarrera == idcarrera)
        .all()
    )
    
    pdf = PDFCarreraReport(orientation="P", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()
    
    pdf.set_text_color(35, 35, 35)
    pdf.set_font("Helvetica", "", 10)
    pdf.cell(0, 6, f"Fecha de emisión: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1, "R")
    pdf.ln(4)

    # Título con el nombre de la carrera
    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, f"Carrera: {nombre_carrera}", 0, 1)
    pdf.ln(4)

    # Cabecera de la tabla ajustada para mostrar Nombres
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_fill_color(31, 41, 55)
    pdf.set_text_color(255, 255, 255)
    
    pdf.cell(20, 8, "ID Rel.", border=1, align="C", fill=True)
    pdf.cell(90, 8, "Materia", border=1, align="L", fill=True)
    pdf.cell(80, 8, "Módulo", border=1, align="L", fill=True)
    pdf.ln()

    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(35, 35, 35)

    if not resultados:
        pdf.cell(190, 10, "No hay materias-módulo vinculadas a esta carrera.", border=1, align="C")
    else:
        for car_mod, materia, modulo in resultados:
            nombre_mat = getattr(materia, 'nombremateria', getattr(materia, 'nombre', 'Materia'))
            nombre_mod = getattr(modulo, 'nombremodulo', getattr(modulo, 'nombre', 'Módulo'))

            pdf.cell(20, 8, str(car_mod.idcarremo), border=1, align="C")
            pdf.cell(90, 8, str(nombre_mat), border=1, align="L")
            pdf.cell(80, 8, str(nombre_mod), border=1, align="L")
            pdf.ln()

    pdf_bytes = bytes(pdf.output())
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=reporte_carrera_{idcarrera}.pdf"}
    )