from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.materias_model import Materias
from models.notas_model import Notas
from models.oferta_seccion_model import Oferta_seccion
from models.plan_evaluacion_model import PlanEvaluacion
from models.estudiante_model import Estudiante
from Schemas.notas_schema import NotaActualizar, NotasEntrada

def obtener_notas_por_id(idnota: int, db: Session):
    nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if nota is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")
    return nota

def listar_notas(db: Session):
    return db.query(Notas).filter(Notas.activo.is_(True)).all()

def crear_nota(nota: NotasEntrada, db: Session):
    oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == nota.oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta indicada no existe")

    nueva_nota = Notas(
        oferta=nota.oferta,
        notas=nota.notas,
        fechanota=nota.fechanota,
        idevaluacion=nota.idevaluacion,
        activo=True
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota

def actualizar_nota_completo(idnota: int, nota_up: NotaActualizar, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if not db_nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")

    for key, value in nota_up.model_dump(exclude_unset=True).items():
        setattr(db_nota, key, value)

    db.commit()
    db.refresh(db_nota)
    return db_nota


def actualizar_nota_parcial(idnota: int, nota_up: NotaActualizar, db: Session):
    return actualizar_nota_completo(idnota, nota_up, db)

def eliminar_nota(idnota: int, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if not db_nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")

    db_nota.activo = False
    db.commit()
    return None

def obtener_notas_estudiante(ciestu: str, idmateria: Optional[int], db: Session):
    query = (db.query(Notas).join(Oferta_seccion, Notas.oferta == Oferta_seccion.idseccmo).filter(Oferta_seccion.estudiante == ciestu, Notas.activo.is_(True)))
    if idmateria:
        query = (query.outerjoin(PlanEvaluacion, Notas.idevaluacion == PlanEvaluacion.idevaluacion).filter(PlanEvaluacion.idmateria == idmateria))
    return query.all()

def crear_nota_validando_docente(nota_in: NotasEntrada, ci_docente: str, db: Session):
    oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == nota_in.oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta indicada no existe")

    if not oferta.estudiante:
        raise HTTPException(
            status_code=400,
            detail="Esta oferta no tiene estudiante asignado. Asigna un estudiante primero."
        )

    materias_docente = (db.query(Materias).filter(Materias.docente == ci_docente, Materias.activo.is_(True)).all())
    if not materias_docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes materias asignadas como docente"
        )

    ids_materias = {m.idmateria for m in materias_docente}

    if nota_in.idevaluacion:
        evaluacion = (
            db.query(PlanEvaluacion).filter(PlanEvaluacion.idevaluacion == nota_in.idevaluacion).first())
        if not evaluacion:
            raise HTTPException(status_code=404, detail="El plan de evaluación no existe")

        if evaluacion.idmateria not in ids_materias:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No estás asignado como docente de esta materia"
            )
    else:
        from sqlalchemy import text
        row = db.execute(
            text("""
                SELECT m.idmateria
                FROM oferta_seccion os
                JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
                JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
                JOIN materia m ON m.idmateria = mm.idmateria
                WHERE os.idseccmo = :idseccmo
                  AND m.docente = :ci
                  AND m.activo = true
                LIMIT 1
            """),
            {"idseccmo": nota_in.oferta, "ci": ci_docente}).fetchone()

        if not row:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No estás asignado como docente de la materia de esta oferta"
            )

    nueva_nota = Notas(
        oferta=nota_in.oferta,
        notas=nota_in.notas,
        fechanota=nota_in.fechanota,
        idevaluacion=nota_in.idevaluacion,
        activo=True
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota


def listar_estudiantes_del_docente(ci_docente: str, db: Session):
    from sqlalchemy import text

    filas = db.execute(
        text("""
            SELECT
                os.idseccmo,
                est.ciestu,
                est.nombreestu,
                est.apelliestu,
                os.idsecc,
                os.horario,
                m.idmateria,
                m.nombremateria
            FROM oferta_seccion os
            JOIN estudiante est ON est.ciestu = os.estudiante
            JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
            JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
            JOIN materia m ON m.idmateria = mm.idmateria
            WHERE os.estudiante IS NOT NULL
              AND m.docente = :ci
              AND m.activo = true
            ORDER BY m.nombremateria, est.apelliestu, est.nombreestu
        """),
        {"ci": ci_docente}
    ).fetchall()

    return [
        {
            "idseccmo": r[0],
            "ciestu": r[1],
            "nombreestu": r[2],
            "apelliestu": r[3],
            "idsecc": r[4],
            "horario": r[5],
            "idmateria": r[6],
            "nombremateria": r[7],
        }
        for r in filas
    ]