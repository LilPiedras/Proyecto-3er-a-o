from models.oferta_seccion_model import *
from Schemas.oferta_seccion_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def listar_ofertas(db: Session):
    secmo = db.query(Oferta_seccion).all()
    if not secmo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin ofertas")
    return secmo

def crear_oferta(seccmo: OfertaEntrada, db:Session):
    seccmo = Oferta_seccion(idcarremo = seccmo.idcarremo,
                            idsecc = seccmo.idsecc,
                            estudiante = seccmo.estudiante,
                            horario = seccmo.horario
                    )
    db.add(seccmo)
    db.commit()
    db.refresh(seccmo)
    return seccmo


def eliminar_curso(idseccmo: int, db: Session):
    db_oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not db_oferta:
        raise HTTPException(status_code=404, detail="La oferta no fue encontrada")

    db_oferta.activo = False
    db.commit()
    return None