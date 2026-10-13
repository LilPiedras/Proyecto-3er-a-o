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
    notas = db.query(Notas).filter(Notas.activo.is_(True)).all()
    if not notas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de notas vacía")
    return notas

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

    notas = query.all()
    if not notas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontraron notas registradas para este estudiante"
        )
    return notas

def crear_nota_validando_docente(nota_in: NotasEntrada, ci_docente: str, db: Session):
    oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == nota_in.oferta).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta indicada no existe")

    if not oferta.estudiante:
        raise HTTPException(
            status_code=400,
            detail="Esta oferta no tiene estudiante asignado. Asigna un estudiante primero."
        )

    if nota_in.idevaluacion:
        evaluacion = db.query(PlanEvaluacion).filter(PlanEvaluacion.idevaluacion == nota_in.idevaluacion).first()

        if not evaluacion:
            raise HTTPException(status_code=404, detail="El plan de evaluación no existe")

        materia = db.query(Materias).filter(Materias.idmateria == evaluacion.idmateria,Materias.activo.is_(True)).first()

        if not materia or materia.docente != ci_docente:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No estás asignado como docente de esta materia"
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
    materias = db.query(Materias).filter(Materias.docente == ci_docente,Materias.activo.is_(True)).all()

    if not materias:
        raise HTTPException(status_code=404, detail="No tienes materias asignadas")

    ofertas = (db.query(Oferta_seccion, Estudiante).join(Estudiante, Oferta_seccion.estudiante == Estudiante.ciestu).filter(Oferta_seccion.estudiante.isnot(None)).all())

    resultado = []
    for oferta, estu in ofertas:
        resultado.append({
            "idseccmo": oferta.idseccmo,
            "ciestu": estu.ciestu,
            "nombreestu": estu.nombreestu,
            "apelliestu": estu.apelliestu,
            "idsecc": oferta.idsecc,
            "horario": oferta.horario
        })

    if not resultado:
        raise HTTPException(status_code=404, detail="No hay estudiantes asignados aún")

    return resultado