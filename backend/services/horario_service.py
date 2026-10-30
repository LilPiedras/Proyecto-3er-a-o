from models.horarios_model import Horario
from Schemas.horario_schema import HorarioEntrada, HorarioActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def obtener_horario_por_id(idhorario: int, db: Session):
    horario = db.query(Horario).filter(Horario.idhorario == idhorario, Horario.activo == True).first()
    if horario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")
    return horario


def listar_horarios(db: Session):
    return db.query(Horario).filter(Horario.activo == True).all()


def crear_horario(horario_data: HorarioEntrada, db: Session):
    try:
        horario = Horario(
            bloque=horario_data.bloque,
            dia=horario_data.dia,
            salon=horario_data.salon,
            activo=True
        )
        db.add(horario)
        db.commit()
        db.refresh(horario)
        return horario
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear el horario. Verifique que los datos asignados sean válidos"
        )


def actualizar_horario_completo(idhorario: int, clockmon: HorarioEntrada, db: Session):
    db_horario = db.query(Horario).filter(Horario.idhorario == idhorario).first()
    if not db_horario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

    for key, value in clockmon.model_dump(exclude_unset=True).items():
        setattr(db_horario, key, value)

    db.commit()
    db.refresh(db_horario)
    return db_horario


def actualizar_horario_parcial(idhorario: int, clockmon: HorarioActualizar, db: Session):
    db_horario = db.query(Horario).filter(Horario.idhorario == idhorario, Horario.activo == True).first()
    if not db_horario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

    update_data = clockmon.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_horario, key, value)

    db.commit()
    db.refresh(db_horario)
    return db_horario


def eliminar_horario(idhorario: int, db: Session):
    db_horario = db.query(Horario).filter(Horario.idhorario == idhorario, Horario.activo == True).first()
    if not db_horario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Horario no encontrado")

    db_horario.activo = False
    db.commit()
    return None