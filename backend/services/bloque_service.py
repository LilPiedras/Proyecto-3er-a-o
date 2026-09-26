from models.bloque_model import Bloque
from Schemas.bloque_schema import BloqueEntrada, BloqueSalida, BloqueActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def obtener_bloque_por_id(idbloque: int, db: Session):
    bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque, Bloque.activo == True).first()
    if bloque is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El bloque no fue encontrado")
    return bloque


def listar_bloques_horarios(db: Session):
    bloques = db.query(Bloque).filter(Bloque.activo == True).all()
    if not bloques:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de bloques vacía")
    return bloques


def crear_bloque(bloque_data: BloqueEntrada, db: Session):
    try:
        bloque = Bloque(
            horainicio=bloque_data.horainicio,
            horafin=bloque_data.horafin,
            activo=True
        )
        db.add(bloque)
        db.commit()
        db.refresh(bloque)
        return bloque
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear el bloque de horario"
        )


def actualizar_horario_completo(idbloque: int, bloque_data: BloqueEntrada, db: Session):
    db_bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque).first()
    if not db_bloque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El bloque no existe o no fue encontrado")

    for key, value in bloque_data.model_dump(exclude_unset=True).items():
        setattr(db_bloque, key, value)

    db.commit()
    db.refresh(db_bloque)
    return db_bloque


def actualizar_horario_parcial(idbloque: int, bloque_data: BloqueActualizar, db: Session):
    db_bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque).first()
    if not db_bloque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El bloque no fue encontrado")

    update_data = bloque_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_bloque, key, value)

    db.commit()
    db.refresh(db_bloque)
    return db_bloque


def eliminar_bloque(idbloque: int, db: Session):
    db_bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque, Bloque.activo == True).first()
    if not db_bloque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El bloque no fue encontrado")

    db_bloque.activo = False
    db.commit()
    return None