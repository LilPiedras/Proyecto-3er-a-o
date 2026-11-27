from datetime import datetime
from fastapi import status, HTTPException
from fastapi.responses import Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from models.estudiante_model import *
from Schemas.estudiante_schema import EstuEntrada, EstudianteSalida, EstudianteActualizar
from analitics.nomina_estudiantes_excel import generar_excel_nomina_estudiantes


def obtener_estudiante_por_id(ciestu: str, db: Session):
    estudiante = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == True).first()
    if estudiante is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no fue encontrado")
    return estudiante


def listar_estudiantes(db: Session):
    estudiante = db.query(Estudiante).filter(Estudiante.activo == True).all()
    if not estudiante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de estudiante vacia")
    return estudiante


def listar_estudiantes_inactivos(db: Session):
    estudiantes = db.query(Estudiante).filter(Estudiante.activo == False).all()
    return estudiantes


def crear_estudiante(estudiante: EstuEntrada, escritor_id: str, db: Session):
    estudiante = Estudiante(
        ciestu=estudiante.ciestu,
        nombreestu=estudiante.nombreestu,
        apelliestu=estudiante.apelliestu,
        teleestu=estudiante.teleestu,
        correoestu=estudiante.correoestu
    )
    db.add(estudiante)

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": escritor_id})
    db.commit()
    db.refresh(estudiante)
    return estudiante


def actualizar_estudiante_completo(ciestu: str, estu_updata: EstuEntrada, escritor_id: str, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="El estudiante no fue encontrado")

    for key, value in estu_updata.model_dump(exclude_unset=True).items():
        setattr(db_estu, key, value)

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": escritor_id})
    db.commit()
    db.refresh(db_estu)
    return db_estu


def actualizar_estudiante_parcial(ciestu: str, estu_updata: EstudianteActualizar, escritor_id: str, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == True).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    update_data = estu_updata.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_estu, key, value)

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": escritor_id})
    db.commit()
    db.refresh(db_estu)
    return db_estu


def eliminar_estudiante(ciestu: str, escritor_id: str, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == True).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")

    db_estu.activo = False

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": escritor_id})
    db.commit()
    return None


def restaurar_estudiante(ciestu: str, escritor_id: str, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == False).first()
    if not db_estu:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El estudiante no existe o ya se encuentra activo"
        )

    db_estu.activo = True

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": escritor_id})
    db.commit()
    db.refresh(db_estu)
    return db_estu


def exportar_nomina_excel(incluir_inactivos: bool, db: Session) -> Response:
    if incluir_inactivos:
        estudiantes = db.query(Estudiante).order_by(Estudiante.ciestu).all()
        titulo_extra = "Incluye inactivos"
        nombre_archivo = f"nomina_estudiantes_todos_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"
    else:
        estudiantes = (
            db.query(Estudiante)
            .filter(Estudiante.activo == True)
            .order_by(Estudiante.ciestu)
            .all()
        )
        titulo_extra = "Solo activos"
        nombre_archivo = f"nomina_estudiantes_activos_{datetime.now().strftime('%Y%m%d_%H%M')}.xlsx"

    contenido_excel = generar_excel_nomina_estudiantes(
        estudiantes,
        titulo_extra=titulo_extra,
    )

    return Response(
        content=contenido_excel,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": f'attachment; filename="{nombre_archivo}"',
        },
    )