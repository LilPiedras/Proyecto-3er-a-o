from models.estudiante_model import *
from Schemas.estudiante_schema import EstuEntrada, EstudianteSalida, EstudianteActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from sqlalchemy import text
from analitics.nomina_estudiantes_excel import generar_excel_nomina_estudiantes
from models.asignacion_docente_model import Asignacion_Docente
from models.materias_model import Materias
from models.seccion_model import Seccion
from models.estudiante_model import Estudiante

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

# Nueva función: Listar estudiantes inactivos (Papelera)
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

def exportar_nomina_excel(db: Session, incluir_inactivos: bool = False) -> bytes:
    q = db.query(Estudiante)
    if not incluir_inactivos:
        q = q.filter(Estudiante.activo.is_(True))
    estudiantes = q.order_by(Estudiante.apelliestu, Estudiante.nombreestu).all()
    return generar_excel_nomina_estudiantes(estudiantes)


def exportar_nomina_por_materia_seccion(
    db: Session,
    *,
    idmateria: int,
    idsecc: int,
    ci_docente: str | None = None,
) -> bytes:
    """
    Nómina de estudiantes inscritos en una materia + sección.
    Si ci_docente viene, valida que esa asignación sea suya.
    """
    materia = db.query(Materias).filter(
        Materias.idmateria == idmateria,
        Materias.activo.is_(True),
    ).first()
    if not materia:
        raise HTTPException(status_code=404, detail="Materia no encontrada")

    seccion = db.query(Seccion).filter(Seccion.idsecc == idsecc).first()
    if not seccion:
        raise HTTPException(status_code=404, detail="Sección no encontrada")

    # Si es docente: debe tener esa materia+sección asignada
    if ci_docente:
        asig = (
            db.query(Asignacion_Docente)
            .filter(
                Asignacion_Docente.empleado_id == ci_docente,
                Asignacion_Docente.materia_id == idmateria,
                Asignacion_Docente.seccion_id == idsecc,
                Asignacion_Docente.activo.is_(True),
            )
            .first()
        )
        # Fallback: materia.docente (como en tu flujo de oferta)
        es_docente_materia = (materia.docente or "") == ci_docente
        if not asig and not es_docente_materia:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes asignada esa materia y sección",
            )

    # Estudiantes en oferta_seccion de esa sección ligados a esa materia
    query = text("""
        SELECT DISTINCT e.ciestu, e.nombreestu, e.apelliestu, e.teleestu, e.correoestu, e.activo
        FROM oferta_seccion os
        JOIN estudiante e ON e.ciestu = os.estudiante
        JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
        JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
        WHERE os.idsecc = :idsecc
          AND mm.idmateria = :idmateria
          AND os.estudiante IS NOT NULL
          AND e.activo = TRUE
        ORDER BY e.apelliestu, e.nombreestu
    """)
    filas = db.execute(query, {"idsecc": idsecc, "idmateria": idmateria}).fetchall()

    class _Row:
        def __init__(self, row):
            self.ciestu = row[0]
            self.nombreestu = row[1]
            self.apelliestu = row[2]
            self.teleestu = row[3]
            self.correoestu = row[4]
            self.activo = row[5]

    estudiantes = [_Row(r) for r in filas]
    titulo = f"{materia.nombremateria} · Sección {seccion.nomsecc}"
    return generar_excel_nomina_estudiantes(estudiantes, titulo_extra=titulo)