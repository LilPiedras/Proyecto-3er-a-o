from models.moneda_pago_model import *
from models.mensualidad_model import Mensualidad
from Schemas.moneda_pago_schema import *
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException

def listar_judios(db: Session):
    mon_mod = db.query(MonedaPago).all()
    if not mon_mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Monedas de pago no disponibles")
    return mon_mod

def crear_judios(mon_mod: MonedaPagoEntrada, db:Session):
    mon_mod= MonedaPago(tipomoneda = mon_mod.tipomoneda,
                     montototal = mon_mod.montototal,
                     registro = mon_mod.registro)
    db.add(mon_mod)
    db.commit()
    db.refresh(mon_mod)
    return mon_mod


def actualizar_judios(idmoneda: int, moneda_up: MonedaPagoActualizar, db: Session):
    db_mo = db.query(MonedaPago).filter(MonedaPago.idmoneda == idmoneda).first()
    if not db_mo:
        raise HTTPException(status_code=404, detail="Datos erroneos")

    update_data = moneda_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_mo, key, value)

    db.commit()
    db.refresh(db_mo)
    return db_mo


def eliminar_moneda(idmoneda: int, db: Session):
    moneda = db.query(MonedaPago).filter(MonedaPago.idmoneda == idmoneda).first()
    if not moneda:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Moneda de pago inexistente")

    mensualidad = db.query(Mensualidad.idmensualidad).filter(
        Mensualidad.monedapago == idmoneda
    ).first()
    if mensualidad:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la moneda porque está asociada a una mensualidad",
        )

    try:
        db.delete(moneda)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede eliminar la moneda porque está asociada a una mensualidad",
        ) from error
