from models.bloque_model import Bloque
from Schemas.bloque_schema import BloqueEntrada, BloqueSalida, BloqueActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException

def _existe_bloque_duplicado(db: Session, horainicio: str, horafin: str, excluir_id: int | None = None):
    query = db.query(Bloque).filter(
        Bloque.horainicio == horainicio,
        Bloque.horafin == horafin,
        Bloque.activo == True
    )
    if excluir_id is not None:
        query = query.filter(Bloque.idbloque != excluir_id)
    return query.first() is not None

def obtener_bloque_por_id(idbloque: int, db: Session):
    bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque, Bloque.activo == True).first()
    if bloque is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El bloque no fue encontrado")
    return bloque


def listar_bloques_horarios(db: Session):
    return db.query(Bloque).filter(Bloque.activo == True).all()

def crear_bloque(bloque_data: BloqueEntrada, db: Session):
    if _existe_bloque_duplicado(db, bloque_data.horainicio, bloque_data.horafin):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Ya existe un bloque activo de {bloque_data.horainicio} a {bloque_data.horafin}."
        )

    nuevo = Bloque(
        horainicio=bloque_data.horainicio,
        horafin=bloque_data.horafin,
        activo=True
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


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