from datetime import datetime
from fastapi import status, HTTPException
from fastapi.responses import Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from models.carrera_modulo_model import Carrera_Modulo
from models.carrera_model import Carrera
from models.materias_modulo_model import Materias_Modulo
from models.materias_model import Materias
from models.modulo_model import Modulo
from Schemas.carrera_modulo_schema import CarreraModuloEntrada, CarreraModuloActualizar
from analitics.carrera_pdf import PDFCarreraReport


def listar_carrera_modulos(db: Session):
    return db.query(Carrera_Modulo).filter(Carrera_Modulo.activo == True).all()


def crear_carrera_modulo(carreram_data: CarreraModuloEntrada, db: Session):
    try:
        carreram = Carrera_Modulo(
            idmatemo=carreram_data.idmatemo,
            idcarrera=carreram_data.idcarrera
        )
        db.add(carreram)
        db.commit()
        db.refresh(carreram)
        return carreram
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad: Verifique que la materia-módulo y la carrera existan"
        )


def actualizar_carrera_modulo_parcial(idcarremo: int, materia_update: CarreraModuloActualizar, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(Carrera_Modulo.idcarremo == idcarremo).first()
    if not db_carremo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La relación no fue encontrada")

    update_data = materia_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_carremo, key, value)

    try:
        db.commit()
        db.refresh(db_carremo)
        return db_carremo
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al actualizar los datos")


def eliminar_carrera_modulo(idcarremo: int, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(
        Carrera_Modulo.idcarremo == idcarremo,
        Carrera_Modulo.activo == True
    ).first()
    if not db_carremo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La relación no fue encontrada")

    db_carremo.activo = False
    db.commit()
    return None


def exportar_pdf_carrera(idcarrera: int, db: Session) -> Response:
    carrera = db.query(Carrera).filter(Carrera.idcarrera == idcarrera).first()
    nombre_carrera = carrera.nombrecarrera if carrera else f"Carrera #{idcarrera}"

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

    pdf.set_font("Helvetica", "B", 14)
    pdf.cell(0, 8, f"Carrera: {nombre_carrera}", 0, 1)
    pdf.ln(4)

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
            nombre_mat = getattr(materia, "nombremateria", getattr(materia, "nombre", "Materia"))
            nombre_mod = getattr(modulo, "nombremodulo", getattr(modulo, "nombre", "Módulo"))

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