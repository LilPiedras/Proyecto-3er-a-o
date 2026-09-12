from models.seccion_model import *
from Schemas.seccion_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException


def listar_secciones(db: Session):
    roles = db.query(Seccion).all()
    if not roles:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de secciones vacia")
    return roles

def crear_seccion(secc: SeccionEntrada, db:Session):
    secc = Seccion(nomsecc = secc.nomsecc)
    db.add(secc)
    db.commit()
    db.refresh(secc)
    return secc

def actualizar_seccion_parcial(idsecc: int, secci: SeccionActualizar, db: Session):
    db_secc = db.query(Seccion).filter(Seccion.idsecc == idsecc).first()
    if not db_secc:
        raise HTTPException(status_code=404, detail="Seccion no encontrada")

    update_data = secci.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_secc, key, value)

    db.commit()
    db.refresh(db_secc)
    return db_secc