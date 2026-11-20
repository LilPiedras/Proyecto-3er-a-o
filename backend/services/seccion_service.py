from models.seccion_model import Seccion
from Schemas.seccion_schema import SeccionEntrada, SeccionActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException
from sqlalchemy import func

def listar_secciones(db: Session):
    return db.query(Seccion).all()

def crear_seccion(secc: SeccionEntrada, db: Session):
    nombre = secc.nomsecc.strip()
    existe = db.query(Seccion).filter(func.lower(func.trim(Seccion.nomsecc)) == nombre.lower()).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una sección con el nombre '{nombre}'"
        )

    try:
        nueva_seccion = Seccion(nomsecc=nombre)
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

    if "nomsecc" in update_data and update_data["nomsecc"]:
        nombre = update_data["nomsecc"].strip()
        existe = db.query(Seccion).filter(
            func.lower(func.trim(Seccion.nomsecc)) == nombre.lower(),
            Seccion.idsecc != idsecc
        ).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una sección con el nombre '{nombre}'"
            )
        update_data["nomsecc"] = nombre

    for key, value in update_data.items():
        setattr(db_secc, key, value)

    db.commit()
    db.refresh(db_secc)
    return db_secc

def eliminar_seccion(idsecc: int, db: Session):
    db_secc = db.query(Seccion).filter(Seccion.idsecc == idsecc).first()
    if not db_secc:
        raise HTTPException(status_code=404, detail="Sección no encontrada")
    try:
        db.delete(db_secc)
        db.commit()
        return None
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar la sección porque está en uso")