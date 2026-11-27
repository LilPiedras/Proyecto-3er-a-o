from datetime import datetime
from fastapi import status, HTTPException
from fastapi.responses import Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.materias_modulo_model import *
from models.materias_model import Materias
from models.modulo_model import Modulo
from models.carrera_modulo_model import Carrera_Modulo
from Schemas.materias_modulo_schema import *

# Ajusta el import según dónde guardes PDFModuloReport (ej. from reportes.modulo_pdf import PDFModuloReport)
from analitics.pdf_modulo_report import PDFModuloReport


def _consulta_relaciones(db: Session):
    return (
        db.query(
            Materias_Modulo.idmatemo,
            Materias_Modulo.idmateria,
            Materias_Modulo.idmodulo,
            Materias.nombremateria,
            Modulo.nombremodulo,
        )
        .join(Materias, Materias.idmateria == Materias_Modulo.idmateria)
        .join(Modulo, Modulo.idmodulo == Materias_Modulo.idmodulo)
    )


def listar_materias_por_modulo(db: Session):
    return _consulta_relaciones(db).order_by(Modulo.nombremodulo, Materias.nombremateria).all()


def crear_oferta(mateo: MateriaModuloEntrada, db: Session):
    mateo = Materias_Modulo(
        idmateria=mateo.idmateria,
        idmodulo=mateo.idmodulo,
    )
    db.add(mateo)
    db.commit()
    db.refresh(mateo)
    return _consulta_relaciones(db).filter(Materias_Modulo.idmatemo == mateo.idmatemo).one()


def actualizar_materias_modulo_parcial(idmatemo: int, mamemon: MateriaModuloActualizar, db: Session):
    db_matemo = db.query(Materias_Modulo).filter(Materias_Modulo.idmatemo == idmatemo).first()
    if not db_matemo:
        raise HTTPException(status_code=404, detail="Horario no encontrado")

    update_data = mamemon.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_matemo, key, value)


def eliminar_materia_modulo(idmatemo: int, db: Session):
    db_oferta = db.query(Materias_Modulo).filter(Materias_Modulo.idmatemo == idmatemo).first()
    if not db_oferta:
        raise HTTPException(status_code=404, detail="La asignacion no fue encontrada")

    relacion_carrera = db.query(Carrera_Modulo.idcarremo).filter(
        Carrera_Modulo.idmatemo == idmatemo
    ).first()
    if relacion_carrera:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede desvincular: esta materia del módulo está asociada a una carrera. Elimina primero esa relación académica.",
        )

    try:
        db.delete(db_oferta)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede desvincular porque la relación todavía está siendo utilizada.",
        ) from error
    return None


def exportar_pdf_modulo(idmodulo: int, db: Session) -> Response:
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
        headers={"Content-Disposition": f"attachment; filename=reporte_modulo_{idmodulo}.pdf"},
    )