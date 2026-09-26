from models.usuario_model import Usuario
from models.user_login_model import UserLogin
from Schemas.usuario_schema import UsuarioEntrada, UsuarioUpdata
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password 
from services.auditoria_service import registrar_auditoria_txt 

def obtener_usuario_por_id(ciuser: str, db: Session):
    usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if usuario is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El usuario no fue encontrado")
    return usuario

def listar_usuario(db: Session):
    usuarios = db.query(Usuario).filter(Usuario.activo == True).all()
    if not usuarios:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de usuarios vacía")
    return usuarios

def registrar_usuario(usuario: UsuarioEntrada, admin_id: str, db: Session):
    existe = db.query(Usuario).filter(Usuario.correousuario == usuario.correousuario).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    nuevo_usuario = Usuario(
        ciuser=usuario.ciuser,
        nombreusuario=usuario.nombreusuario,
        apellusuario=usuario.apellusuario,
        contrase=hashear_password(usuario.contrase),
        empleado=usuario.empleado,
        estudiante=usuario.estudiante,
        correousuario=usuario.correousuario,
        teleusuario=usuario.teleusuario,
        activo=True
    )
    db.add(nuevo_usuario)
    
    # BYPASS AUDITORIA capturar los datos hacia txt
    datos_nuevos_dict = {col.name: getattr(nuevo_usuario, col.name) for col in nuevo_usuario.__table__.columns}
    registrar_auditoria_txt(db, admin_id, nuevo_usuario.ciuser, 'INSERT', None, datos_nuevos_dict)

    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


def actualizar_usuario_completo(ciuser: str, usuario_updata: UsuarioUpdata, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    datos_viejos_dict = {col.name: getattr(db_usuario, col.name) for col in db_usuario.__table__.columns}

    update_data = usuario_updata.model_dump(exclude_unset=True)
    if "contrase" in update_data and update_data["contrase"]:
        update_data["contrase"] = hashear_password(update_data["contrase"])

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    #Capturar los datos nuevos después del cambio
    datos_nuevos_dict = {col.name: getattr(db_usuario, col.name) for col in db_usuario.__table__.columns}

    # BYPASS DE LA AUDITORIA
    registrar_auditoria_txt(db, admin_id, ciuser, 'UPDATE', datos_viejos_dict, datos_nuevos_dict)

    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def actualizar_usuario_parcial(ciuser: str, usuario_updata: UsuarioUpdata, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # MAS DE LO MISMO
    datos_viejos_dict = {col.name: getattr(db_usuario, col.name) for col in db_usuario.__table__.columns}

    update_data = usuario_updata.model_dump(exclude_unset=True)
    if "contrase" in update_data and update_data["contrase"]:
        update_data["contrase"] = hashear_password(update_data["contrase"])

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    datos_nuevos_dict = {col.name: getattr(db_usuario, col.name) for col in db_usuario.__table__.columns}

    registrar_auditoria_txt(db, admin_id, ciuser, 'UPDATE', datos_viejos_dict, datos_nuevos_dict)

    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def eliminar_usuario(ciuser: str, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # MAS DE LO MISMO X2
    datos_viejos_dict = {col.name: getattr(db_usuario, col.name) for col in db_usuario.__table__.columns}

    db_usuario.activo = False
    db_login = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo == True).first()
    if db_login:
        db_login.activo = False
        
    registrar_auditoria_txt(db, admin_id, ciuser, 'DELETE', datos_viejos_dict, None)

    db.commit()
    return None