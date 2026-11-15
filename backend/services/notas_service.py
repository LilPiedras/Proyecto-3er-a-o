from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

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
            detail="Esta oferta no tiene estudiante asignado. Asigna un estudiante primero.",
        )

    if not nota_in.idevaluacion:
        raise HTTPException(
            status_code=400,
            detail="Debes indicar una evaluación del plan (idevaluacion).",
        )

    evaluacion = (db.query(PlanEvaluacion).filter(PlanEvaluacion.idevaluacion == nota_in.idevaluacion).first())
    if not evaluacion:
        raise HTTPException(status_code=404, detail="El plan de evaluación no existe")

    materia = (db.query(Materias).filter(Materias.idmateria == evaluacion.idmateria, Materias.activo.is_(True)).first())
    if not materia:
        raise HTTPException(status_code=404, detail="La materia del plan no existe")

    if materia.docente != ci_docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No estás asignado como docente de esta materia",
        )

    if oferta.idcarremo:
        row = db.execute(
            text("""
                SELECT mm.idmateria
                FROM carrera_modulo cm
                JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
                WHERE cm.idcarremo = :idcarremo
                LIMIT 1
            """),
            {"idcarremo": oferta.idcarremo},
        ).fetchone()
        if row and int(row[0]) != int(evaluacion.idmateria):
            raise HTTPException(
                status_code=400,
                detail="La evaluación no pertenece a la materia de esta oferta",
            )

    existe = (
        db.query(Notas).filter(
            Notas.oferta == nota_in.oferta,
            Notas.idevaluacion == nota_in.idevaluacion,
            Notas.activo.is_(True)).first()
    )
    if existe:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una nota para esta oferta y esta evaluación. Edítala en lugar de crear otra.",
        )

    nueva_nota = Notas(
        oferta=nota_in.oferta,
        notas=nota_in.notas,
        fechanota=nota_in.fechanota,
        idevaluacion=nota_in.idevaluacion,
        activo=True,
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota

def listar_estudiantes_del_docente(ci_docente: str, db: Session):
    rows = db.execute(
        text("""
            SELECT
                os.idseccmo,
                e.ciestu,
                e.nombreestu,
                e.apelliestu,
                os.idsecc,
                os.horario,
                m.idmateria,
                m.nombremateria
            FROM oferta_seccion os
            JOIN estudiante e ON e.ciestu = os.estudiante AND e.activo IS TRUE
            LEFT JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
            LEFT JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
            LEFT JOIN materia m ON m.idmateria = mm.idmateria AND m.activo IS TRUE
            WHERE os.estudiante IS NOT NULL
              AND m.docente = :ci
            ORDER BY e.apelliestu, e.nombreestu
        """),
        {"ci": ci_docente},
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
        for r in rows
    ]

def listar_notas_del_docente(ci_docente: str, db: Session):
    rows = db.execute(
        text("""
            SELECT
                n.idnota,
                n.notas,
                n.oferta,
                n.idevaluacion,
                n.fechanota,
                n.activo,
                e.ciestu,
                e.nombreestu,
                e.apelliestu,
                pe.titulo AS titulo_evaluacion,
                m.nombremateria
            FROM nota n
            JOIN oferta_seccion os ON os.idseccmo = n.oferta
            JOIN estudiante e ON e.ciestu = os.estudiante
            LEFT JOIN plan_evaluacion pe ON pe.idevaluacion = n.idevaluacion
            LEFT JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
            LEFT JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
            LEFT JOIN materia m ON m.idmateria = mm.idmateria
            WHERE n.activo IS TRUE
              AND m.docente = :ci
            ORDER BY n.idnota DESC
        """),
        {"ci": ci_docente},
    ).fetchall()

    return [
        {
            "idnota": r[0],
            "notas": float(r[1]) if r[1] is not None else None,
            "oferta": r[2],
            "idevaluacion": r[3],
            "fechanota": r[4].isoformat() if r[4] else None,
            "activo": r[5],
            "ciestu": r[6],
            "nombreestu": r[7],
            "apelliestu": r[8],
            "titulo_evaluacion": r[9],
            "nombremateria": r[10],
        }
        for r in rows
    ]