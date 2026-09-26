from models.carrera_modulo_model import Carrera_Modulo
from Schemas.carrera_modulo_schema import CarreraModuloEntrada, CarreraModuloActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def listar_carrera_modulos(db: Session):
    carreram = db.query(Carrera_Modulo).filter(Carrera_Modulo.activo == True).all()
    if not carreram:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Relaciones de carrera-módulo vacías")
    return carreram


def crear_carrera_modulo(carreram_data: CarreraModuloEntrada, db: Session):
    try:
        carreram = Carrera_Modulo(
            idmatemo=carreram_data.idmatemo,
            idcarrera=carreram_data.idcarrera
        )
        db.add(carreram)
        db.commit()
        db.refresh(carreram)
        return carreram
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad: Verifique que la materia-módulo y la carrera existan"
        )


def actualizar_carrera_modulo_parcial(idcarremo: int, materia_update: CarreraModuloActualizar, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(Carrera_Modulo.idcarremo == idcarremo).first()
    if not db_carremo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La relación no fue encontrada")

    update_data = materia_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_carremo, key, value)

    try:
        db.commit()
        db.refresh(db_carremo)
        return db_carremo
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Error de integridad al actualizar los datos")


def eliminar_carrera_modulo(idcarremo: int, db: Session):
    db_carremo = db.query(Carrera_Modulo).filter(
        Carrera_Modulo.idcarremo == idcarremo, 
        Carrera_Modulo.activo == True
    ).first()
    if not db_carremo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La relación no fue encontrada")

    db_carremo.activo = False
    db.commit()
    return None