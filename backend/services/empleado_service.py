from models.empleado_model import *
from Schemas.empleado_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from sqlalchemy import text # Agregado para el Trigger

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

def crear_empleado(empleado: EmpleadoEntrada, escritor_id: str, db:Session):
    empleado= Empleado(ciempleado = empleado.ciempleado,
                     nombreempleado = empleado.nombreempleado,
                     apellidoempleado = empleado.apellidoempleado,
                     fechacontra= empleado.fechacontra,
                     cargo = empleado.cargo,
                     telefempleado = empleado.telefempleado,
                     correoempleado = empleado.correoempleado)
    db.add(empleado)
    
    db.execute(text(f"SET LOCAL app.current_admin_id = '{escritor_id}'"))
    db.commit()
    db.refresh(empleado)
    return empleado

def actualizar_empleado_completo(ciempleado: str, emple_update: EmpleadoUpdate, escritor_id: str, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = emple_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_empleado, key, value)

    db.execute(text(f"SET LOCAL app.current_admin_id = '{escritor_id}'"))
    db.commit()
    db.refresh(db_empleado)
    return db_empleado

def actualizar_empleado_parcial(ciempleado: str, empleado_update: EmpleadoUpdate, escritor_id: str, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado, Empleado.activo == True).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = empleado_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_empleado, key, value)

    db.execute(text(f"SET LOCAL app.current_admin_id = '{escritor_id}'"))
    db.commit()
    db.refresh(db_empleado)
    return db_empleado

def eliminar_empleado(ciempleado: str, escritor_id: str, db: Session):
    db_empleado = db.query(Empleado).filter(Empleado.ciempleado == ciempleado, Empleado.activo==True).first()
    if not db_empleado:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    # Aki en lugar de db.delete(db_cliente), hacemos que ese maldito cambie su estado civil a desaperecido
    db_empleado.activo = False
    
    db.execute(text(f"SET LOCAL app.current_admin_id = '{escritor_id}'"))
    db.commit()
    return None