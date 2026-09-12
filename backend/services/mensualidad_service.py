from models.mensualidad_model import *
from Schemas.mensualidad_schema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_mensualidad_por_id(idmensualidad:int, db:Session):
    mensualidad = db.query(Mensualidad).filter(Mensualidad.idmensualidad == idmensualidad).first()
    if mensualidad is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mensualidad no fue encontrado")
    return mensualidad

def listar_mensualidades(db: Session):
    mensualidad = db.query(Mensualidad).all()
    if not mensualidad:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de mensualidades vacia")
    return mensualidad

def crear_mensualidad(mensualidad: MensualidadEntrada, db:Session):
    mensualidad = Mensualidad(metodopago = mensualidad.metodopago,
                     monedapago = mensualidad.monedapago,
                     monto = mensualidad.monto,
                     verificacion = mensualidad.verificacion)
    db.add(mensualidad)
    db.commit()
    db.refresh(mensualidad)
    return mensualidad


def actualizar_mensualidad_parcial(idmensualidad: int, men_update: MensualidadActualizar, db: Session):
    db_estu = db.query(Mensualidad).filter(Mensualidad.idmensualidad == idmensualidad).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = men_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_estu, key, value)

    db.commit()
    db.refresh(db_estu)
    return db_estu
