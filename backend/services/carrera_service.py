from models.carrera_model import *
from Schemas.carrera_schema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_carrera_por_id(idcarrera:int, db:Session):
    carri = db.query(Carrera).filter(Carrera.idcarrera == idcarrera, Carrera.activo == True).first()
    if carri is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no fue encontrado")
    return carri

def listar_carrera(db: Session):
    carri = db.query(Carrera).filter(Carrera.activo == True).all()
    if not carri:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de horariosvacia")
    return carri

def crear_bloque(carri: CarreraEntrada, db:Session):
    carri = Carrera(nombrecarrera  = carri.nombrecarrera,
                     descripcion = carri.descripcion)
    db.add(carri)
    db.commit()
    db.refresh(carri)
    return carri

def actualizar_carrera_parcial(idcarrera: int, carrera_up: CarreraUpdata, db: Session):
    db_car = db.query(Carrera).filter(Carrera.idcarrera == idcarrera).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="La carrera no pudo ser encontrada")

    update_data = carrera_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_car, key, value)

    db.commit()
    db.refresh(db_car)
    return db_car

def eliminar_carrera(idcarrera: int, db: Session):
    db_car = db.query(Carrera).filter(Carrera.idcarrera == idcarrera, Carrera.activo==True).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="La carrera no fue encontrada o no existe")

    db_car.activo = False
    db.commit()
    return None