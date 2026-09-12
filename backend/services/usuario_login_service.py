from models.user_login_model import *
from Schemas.usuario_login_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def crear_login(log: Login_UserEntrada, db:Session):
    log = UserLogin(ciuser = log.ciuser,
                   idrol = log.idrol)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def actualizar_roles_parcial(ciuser_log: int, logbait: Login_UserActualizar, db: Session):
    db_log = db.query(ciuser_log).filter(UserLogin.ciuser_log == ciuser_log).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Seccion no encontrada")

    update_data = logbait.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_log, key, value)

    db.commit()
    db.refresh(db_log)
    return db_log

def eliminar_curso(ciuser_log: int, db: Session):
    db_oferta = db.query(UserLogin).filter(UserLogin.ciuser_log == ciuser_log, UserLogin.active == True).first()
    if not db_oferta:
        raise HTTPException(status_code=404, detail="La asignacion no fue encontrada")

    db_oferta.activo = False
    db.commit()
    return None