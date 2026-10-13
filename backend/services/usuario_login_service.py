from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from models.user_login_model import UserLogin
from models.usuario_model import Usuario
from models.rol_model import Rol
from Schemas.usuario_login_schema import Login_UserEntrada, Login_UserActualizar

def crear_login(log: Login_UserEntrada, db: Session):
    usuario = db.query(Usuario).filter(Usuario.ciuser == log.ciuser).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="El usuario no existe")

    rol = db.query(Rol).filter(Rol.idrol == log.idrol, Rol.activo.is_(True)).first()
    if not rol:
        raise HTTPException(status_code=404, detail="El rol no existe o está inactivo")

    existe = db.query(UserLogin).filter(UserLogin.ciuser == log.ciuser,UserLogin.idrol == log.idrol, UserLogin.activo.is_(True)).first()
    if existe:
        raise HTTPException(
            status_code=409,
            detail="El usuario ya tiene este rol asignado"
        )

    try:
        nuevo = UserLogin(
            ciuser=log.ciuser,
            idrol=log.idrol,
            activo=True
        )
        db.add(nuevo)
        db.commit()
        db.refresh(nuevo)
        return nuevo
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="El usuario ya tiene este rol (restricción de base de datos)"
        )

def listar_roles_usuario(ciuser: str, db: Session):
    roles = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo.is_(True)).all()
    if not roles:
        raise HTTPException(status_code=404, detail="El usuario no tiene roles asignados")
    return roles

def actualizar_roles_parcial(ciuser_log: int, logbait: Login_UserActualizar, db: Session):
    db_log = db.query(UserLogin).filter(UserLogin.ciuser_log == ciuser_log).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="Registro de rol no encontrado")

    update_data = logbait.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_log, key, value)

    db.commit()
    db.refresh(db_log)
    return db_log

def eliminar_rol_usuario(ciuser_log: int, db: Session):
    db_log = db.query(UserLogin).filter(UserLogin.ciuser_log == ciuser_log, UserLogin.activo.is_(True)).first()
    if not db_log:
        raise HTTPException(status_code=404, detail="La asignación de rol no fue encontrada")

    otros = db.query(UserLogin).filter(UserLogin.ciuser == db_log.ciuser, UserLogin.activo.is_(True), UserLogin.ciuser_log != ciuser_log).count()

    if otros == 0:
        raise HTTPException(
            status_code=400,
            detail="No se puede quitar el único rol del usuario"
        )

    db_log.activo = False
    db.commit()
    return None