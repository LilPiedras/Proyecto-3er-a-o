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


def _existe_horario_duplicado(db: Session, dia: str, bloque: int, salon: str, excluir_id: int | None = None):
    query = db.query(Horario).filter(
        Horario.dia == dia,
        Horario.bloque == bloque,
        Horario.salon == salon,
        Horario.activo == True
    )
    if excluir_id is not None:
        query = query.filter(Horario.idhorario != excluir_id)

    return query.first() is not None


def crear_horario(horario_data: HorarioEntrada, db: Session):
    # Validar que no exista el mismo día + bloque + salón
    if _existe_horario_duplicado(db, horario_data.dia, horario_data.bloque, horario_data.salon):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un horario activo el día {horario_data.dia} en el bloque {horario_data.bloque} y salón {horario_data.salon}."
        )

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

    # Validar duplicado (excluyendo el propio registro)
    if _existe_horario_duplicado(db, clockmon.dia, clockmon.bloque, clockmon.salon, excluir_id=idhorario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un horario activo el día {clockmon.dia} en el bloque {clockmon.bloque} y salón {clockmon.salon}."
        )

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

    dia = update_data.get("dia", db_horario.dia)
    bloque = update_data.get("bloque", db_horario.bloque)
    salon = update_data.get("salon", db_horario.salon)

    if _existe_horario_duplicado(db, dia, bloque, salon, excluir_id=idhorario):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un horario activo el día {dia} en el bloque {bloque} y salón {salon}."
        )

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