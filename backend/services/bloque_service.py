from models.bloque_model import *
from Schemas.bloque_schema import  BloqueEntrada, BloqueSalida, BloqueActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_bloque_por_id(idbloque:int, db:Session):
    bloque = db.query(Bloque).filter(Bloque.idbloque == idbloque, Bloque.activo == True).first()
    if bloque is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no fue encontrado")
    return bloque

def listar_bloques_horarios(db: Session):
    bloque = db.query(Bloque).filter(Bloque.activo == True).all()
    if not bloque:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de horariosvacia")
    return bloque

def crear_bloque(bloque: BloqueEntrada, db:Session):
    bloque = Bloque(dia  = bloque.dia,
                     horainicio = bloque.horainicio,
                     horafin = bloque.horafin)
    db.add(bloque)
    db.commit()
    db.refresh(bloque)
    return bloque

def actualizar_horarios_completo(idbloque: int, toy_agumon_updata: BloqueEntrada, db: Session):
    db_toy = db.query(Bloque).filter(Bloque.idbloque == idbloque).first()
    if not db_toy:
        raise HTTPException(status_code=404, detail="El horario no existe o pudo ser encontrado")

    for key, value in toy_agumon_updata.model_dump(exclude_unset=True).items():
        setattr(db_toy, key, value)

    db.commit()
    db.refresh(db_toy)
    return db_toy

def actualizar_horario_parcial(idbloque: int, toy_agumon_update: BloqueActualizar, db: Session):
    db_toy = db.query(Bloque).filter(Bloque.idbloque == idbloque).first()
    if not db_toy:
        raise HTTPException(status_code=404, detail="El horario no fue encontrado")

    update_data = toy_agumon_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_toy, key, value)

    db.commit()
    db.refresh(db_toy)
    return db_toy

def eliminar_bloque(idbloque: int, db: Session):
    db_toy = db.query(Bloque).filter(Bloque.idbloque == idbloque, Bloque.activo==True).first()
    if not db_toy:
        raise HTTPException(status_code=404, detail="El horario no fue encontrado")

    db_toy.activo = False
    db.commit()
    return None