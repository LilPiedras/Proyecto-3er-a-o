from models.metodo_pago_model import *
from Schemas.metodo_pago_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def listar_metodos(db: Session):
    met_mod = db.query(MetodoPago).all()
    if not met_mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Metodo de pago inexistente")
    return met_mod

def crear_metodo(mon_mod: MetodoPagoEntrada, db:Session):
    mon_mod= MetodoPago(metodousado = mon_mod.metodousado,
                     registro = mon_mod.registro)
    db.add(mon_mod)
    db.commit()
    db.refresh(mon_mod)
    return mon_mod


def actualizar_metodos(idmetodopago: int, moneda_up: MetodoPagoActualizar, db: Session):
    db_mo = db.query(MetodoPago).filter(MetodoPago.idmetodopago == idmetodopago).first()
    if not db_mo:
        raise HTTPException(status_code=404, detail="Metodo inexistente")

    update_data = moneda_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_mo, key, value)

    db.commit()
    db.refresh(db_mo)
    return db_mo
