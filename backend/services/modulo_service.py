from models.modulo_model import Modulo
from Schemas.modulo_schema import ModuloEntrada, ModuloActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_modulo_por_id(idmodulo: int, db: Session):
    modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo, Modulo.activo == True).first()
    if modulo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El módulo no fue encontrado")
    return modulo

def listar_modulo(db: Session):
    modulos = db.query(Modulo).filter(Modulo.activo == True).all()
    if not modulos:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de módulos vacía")
    return modulos

def crear_modulo(modulo: ModuloEntrada, db: Session):
    nuevo_modulo = Modulo(
        nombremodulo=modulo.nombremodulo, 
        activo=modulo.activo if modulo.activo is not None else True
    )
    db.add(nuevo_modulo)
    db.commit()
    db.refresh(nuevo_modulo)
    return nuevo_modulo

def actualizar_completo(idmodulo: int, modulo_update: ModuloEntrada, db: Session):
    db_modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="El módulo no existe")

    for key, value in modulo_update.model_dump(exclude_unset=True).items():
        setattr(db_modulo, key, value)

    db.commit()
    db.refresh(db_modulo)
    return db_modulo

def actualizar_modulo_parcial(idmodulo: int, modulo_update: ModuloActualizar, db: Session):
    db_modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="El módulo no fue encontrado")

    update_data = modulo_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_modulo, key, value)

    db.commit()
    db.refresh(db_modulo)
    return db_modulo

def eliminar_modulo(idmodulo: int, db: Session):
    db_modulo = db.query(Modulo).filter(Modulo.idmodulo == idmodulo, Modulo.activo == True).first()
    if not db_modulo:
        raise HTTPException(status_code=404, detail="El módulo no fue encontrado")

    db_modulo.activo = False
    db.commit()
    return None