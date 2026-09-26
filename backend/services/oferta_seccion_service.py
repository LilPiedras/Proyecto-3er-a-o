from models.oferta_seccion_model import Oferta_seccion
from Schemas.oferta_seccion_schema import OfertaEntrada, OfertaActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException


def listar_ofertas(db: Session):
    secmo = db.query(Oferta_seccion).filter(Oferta_seccion.activo == True).all()
    if not secmo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin ofertas inscritas")
    return secmo


def crear_oferta(seccmo: OfertaEntrada, db: Session):
    try:
        nueva_oferta = Oferta_seccion(
            idcarremo=seccmo.idcarremo,
            idsecc=seccmo.idsecc,
            estudiante=seccmo.estudiante,
            horario=seccmo.horario
        )
        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)
        return nueva_oferta
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)
        if "unq_estudiante_seccion" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El estudiante ya se encuentra inscrito en esta sección."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al registrar la oferta/inscripción."
        )


def actualizar_oferta_parcial(idseccmo: int, oferta_update: OfertaActualizar, db: Session):
    db_oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not db_oferta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La oferta no fue encontrada")

    update_data = oferta_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_oferta, key, value)

    try:
        db.commit()
        db.refresh(db_oferta)
        return db_oferta
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo actualizar la oferta por violación de restricciones"
        )


def eliminar_oferta(idseccmo: int, db: Session):
    db_oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not db_oferta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La oferta no fue encontrada")

    db_oferta.activo = False
    db.commit()
    return None