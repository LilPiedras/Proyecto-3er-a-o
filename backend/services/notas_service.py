from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from models.materias_model import Materias
from models.notas_model import Notas
from models.oferta_seccion_model import Oferta_seccion
from models.plan_evaluacion_model import PlanEvaluacion
from Schemas.notas_schema import NotaActualizar, NotasEntrada


def obtener_notas_por_id(idnota: int, db: Session):
    nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if nota is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")
    return nota


def listar_notas(db: Session):
    notas = db.query(Notas).filter(Notas.activo.is_(True)).all()
    if not notas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de notas vacía")
    return notas


def crear_nota(nota: NotasEntrada, db: Session):
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
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if not db_nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")

    update_data = nota_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_nota, key, value)

    db.commit()
    db.refresh(db_nota)
    return db_nota


def eliminar_nota(idnota: int, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo.is_(True)).first()
    if not db_nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")

    db_nota.activo = False
    db.commit()
    return None


def obtener_notas_estudiante(ciestu: str, idmateria: Optional[int], db: Session):
    query = (
        db.query(Notas)
        .join(Oferta_seccion, Notas.oferta == Oferta_seccion.idseccmo)
        .join(PlanEvaluacion, Notas.idevaluacion == PlanEvaluacion.idevaluacion)
        .filter(Oferta_seccion.estudiante == ciestu, Notas.activo.is_(True))
    )

    if idmateria:
        query = query.filter(PlanEvaluacion.idmateria == idmateria)

    notas = query.all()
    if not notas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas registradas para los criterios consultados"
        )
    return notas


def crear_nota_validando_docente(nota_in: NotasEntrada, ci_docente: str, db: Session):
    evaluacion = db.query(PlanEvaluacion).filter(
        PlanEvaluacion.idevaluacion == nota_in.idevaluacion
    ).first()

    if not evaluacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El plan de evaluación especificado no existe")

    materia = db.query(Materias).filter(
        Materias.idmateria == evaluacion.idmateria,
        Materias.activo.is_(True)
    ).first()

    if not materia or materia.docente != ci_docente:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acceso denegado: No estás asignado como docente de esta materia"
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