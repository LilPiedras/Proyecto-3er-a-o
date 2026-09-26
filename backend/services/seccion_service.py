from models.seccion_model import Seccion
from Schemas.seccion_schema import SeccionEntrada, SeccionActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def listar_secciones(db: Session):
    secciones = db.query(Seccion).all()
    if not secciones:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de secciones vacía")
    return secciones


def crear_seccion(secc: SeccionEntrada, db: Session):
    try:
        nueva_seccion = Seccion(nomsecc=secc.nomsecc)
        db.add(nueva_seccion)
        db.commit()
        db.refresh(nueva_seccion)
        return nueva_seccion
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error al crear la sección"
        )


def actualizar_seccion_parcial(idsecc: int, secci: SeccionActualizar, db: Session):
    db_secc = db.query(Seccion).filter(Seccion.idsecc == idsecc).first()
    if not db_secc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sección no encontrada")

    update_data = secci.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_secc, key, value)

    db.commit()
    db.refresh(db_secc)
    return db_secc