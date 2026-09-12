from models.modulo_model import *
from Schemas.modulo_schema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_modulo_por_id(idmodulo:int, db:Session):
    modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo, Modulo.activo == True).first()
    if modulo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La materia no fue encontrado")
    return modulo

def listar_modulo(db: Session):
    modulo = db.query(Modulo).filter(Modulo.activo == True, Modulo.activo == True).all()
    if not modulo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de materias vacia")
    return modulo

def crear_modulo(modulo: ModuloEntrada, db:Session):
    modulo = Modulo(nombremodulo  = modulo.nombremodulo)
    db.add(modulo)
    db.commit()
    db.refresh(modulo)
    return modulo

def actualizar__completo(idmodulo: int, materia_updata: ModuloEntrada, db: Session):
    db_modulo = db_modulo.query(Modulo).filter(Modulo.idmodulo == idmodulo).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="El modulo no existe o pudo ser encontrado")

    for key, value in materia_updata.model_dump(exclude_unset=True).items():
        setattr(db_modulo, key, value)

    db.commit()
    db.refresh(db_modulo)
    return db_modulo

def actualizar_modulo_parcial(idmodulo: int, modulo_updata: ModuloActualizar, db: Session):
    db_materia = db.query(Modulo).filter(Modulo.idmodulo == idmodulo).first()
    if not db_materia:
        raise HTTPException(status_code=404, detail="El modulo no fue encontrado")

    update_data = modulo_updata.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_materia, key, value)

    db.commit()
    db.refresh(db_materia)
    return db_materia

def eliminar_modulo(idmodulo: int, db: Session):
    db_modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo, Modulo.activo==True).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="EL modulo no fue encontrado")

    db_modulo.activo = False
    db.commit()
    return None