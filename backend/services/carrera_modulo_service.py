from models.carrera_modulo_model import *
from Schemas.carrera_modulo_schema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException


def listar_carreras_horarios(db: Session):
    carreram = db.query(Carrera_Modulo).filter(Carrera_Modulo.activo == True).all()
    if not carreram:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relaciones de carreras vacia")
    return carreram

def crear_carrera(carreram: CarreraModuloEntrada, db:Session):
    carreram = Carrera_Modulo(idmatemo  = carreram.idmatemo,
                     idcarrera = carreram.idcarrera)
    db.add(carreram)
    db.commit()
    db.refresh(carreram)
    return carreram

def actualizar_materia_parcial(idcarremo: int, materia_update: CarreraModuloActualizar, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(Carrera_Modulo.idcarremo == idcarremo).first()
    if not db_carremo:
        raise HTTPException(status_code=404, detail="La relacion no pudo ser encontrada")

    update_data = materia_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_carremo, key, value)

    db.commit()
    db.refresh(db_carremo)
    return db_carremo

def eliminar_materia(idcarremo: int, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(Carrera_Modulo.idcarremo == idcarremo, Carrera_Modulo.activo==True).first()
    if not db_carremo:
        raise HTTPException(status_code=404, detail="La materia no fue encontrada")

    db_carremo.activo = False
    db.commit()
    return None