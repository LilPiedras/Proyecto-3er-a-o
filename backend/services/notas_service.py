from sqlalchemy.orm import Session
from models.notas_model import PlanEvaluacion, Notas
from Schemas.notas_schema import PlanEvaluacionCrear, NotasEntrada
from decimal import Decimal
from fastapi import HTTPException, status

def crear_evaluacion_y_recalcular_porcentajes(eval_in: PlanEvaluacionCrear, db: Session):
    # 1. Crear la nueva evaluación
    nueva_eval = PlanEvaluacion(
        idmateria=eval_in.idmateria,
        idsecc=eval_in.idsecc,
        titulo=eval_in.titulo,
        porcentaje=Decimal("0.00")
    )
    db.add(nueva_eval)
    db.commit()

    # 2. Contar el total de evaluaciones registradas para esa materia y sección
    totales = db.query(PlanEvaluacion).filter(
        PlanEvaluacion.idmateria == eval_in.idmateria,
        PlanEvaluacion.idsecc == eval_in.idsecc
    ).all()

    # 3. Repartir equitativamente el 100% entre todas
    if totales:
        porcentaje_equitativo = Decimal("100.00") / Decimal(len(totales))
        for ev in totales:
            ev.porcentaje = porcentaje_equitativo
        db.commit()

    return nueva_eval

def registrar_nota_estudiante(nota_in: NotasEntrada, db: Session):
    # Validar que la nota esté dentro de la escala 0 a 20
    if nota_in.notas < 0 or nota_in.notas > 20:
        raise HTTPException(status_code=400, detail="La nota debe estar entre 0 y 20")

    nueva_nota = Notas(
        oferta=nota_in.oferta,
        idevaluacion=nota_in.idevaluacion,
        notas=nota_in.notas
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota