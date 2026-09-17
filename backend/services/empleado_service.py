from models.empleado_model import *
from Schemas.empleado_schema import EmpleadoEntrada, EmpleadoUpdate
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_empleado_por_id(ciempleado:str, db:Session):
    empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado, Empleado.activo == True).first()
    if empleado is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no Encontrado")
    return empleado

def listar_empleados(db: Session):
    empleado = db.query(Empleado).filter(Empleado.activo == True).all()
    if not empleado:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de empleado vacia")
    return empleado

def crear_empleado(empleado: EmpleadoEntrada, db:Session):
    empleado= Empleado(ciempleado = empleado.ciempleado,
                     nombreempleado = empleado.nombreempleado,
                     apellidoempleado = empleado.apellidoempleado,
                     fechacontra= empleado.fechacontra,
                     telefempleado = empleado.telefempleado,
                     correoempleado = empleado.correoempleado)
    db.add(empleado)
    db.commit()
    db.refresh(empleado)
    return empleado

def actualizar_empleado_completo(ciempleado: str, emple_update: EmpleadoEntrada, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    for key, value in emple_update.model_dump(exclude_unset=True).items():
        setattr(db_empleado, key, value)

    db.commit()
    db.refresh(db_empleado)
    return db_empleado

def actualizar_empleado_parcial(ciempleado: str, empleado_update: EmpleadoUpdate, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado, Empleado.activo == True).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = empleado_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_empleado, key, value)

    db.commit()
    db.refresh(db_empleado)
    return db_empleado

def eliminar_empleado(ciempleado: str, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado, Empleado.activo==True).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    # Aki en lugar de db.delete(db_cliente), hacemos que ese maldito cambie su estado civil a desaperecido
    db_empleado.activo = False
    db.commit()
    return None