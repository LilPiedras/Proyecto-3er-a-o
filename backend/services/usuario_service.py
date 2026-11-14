from models.usuario_model import Usuario
from models.user_login_model import UserLogin
from Schemas.usuario_schema import UsuarioEntrada, UsuarioUpdata
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password 
from sqlalchemy import func, text # Agregado para enviar el ID al trigger de PostgreSQL

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
    correo_normalizado = usuario.correousuario.strip().lower()
    
    # 1. Buscar si ya existe un registro con esa cédula (incluso si está inactivo)
    usuario_existente = db.query(Usuario).filter(Usuario.ciuser == usuario.ciuser).first()
    
    if usuario_existente:
        if not usuario_existente.activo:
            # Si el usuario existe pero estaba desactivado, lo reactivamos y actualizamos sus datos
            usuario_existente.activo = True
            usuario_existente.nombreusuario = usuario.nombreusuario
            usuario_existente.apellusuario = usuario.apellusuario
            usuario_existente.contrase = hashear_password(usuario.contrase)
            usuario_existente.correousuario = correo_normalizado
            usuario_existente.teleusuario = usuario.teleusuario
            usuario_existente.empleado = usuario.empleado
            usuario_existente.estudiante = usuario.estudiante
            
            db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))
            db.commit()
            db.refresh(usuario_existente)
            return usuario_existente
        else:
            raise HTTPException(status_code=400, detail="El usuario ya existe y se encuentra activo")

    # 2. Validar también que el correo no pertenezca a otro usuario activo
    existe_correo = db.query(Usuario).filter(
        func.lower(func.trim(Usuario.correousuario)) == correo_normalizado,
        Usuario.activo == True
    ).first()
    if existe_correo:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado")

    nuevo_usuario = Usuario(
        ciuser=usuario.ciuser,
        nombreusuario=usuario.nombreusuario,
        apellusuario=usuario.apellusuario,
        contrase=hashear_password(usuario.contrase),
        empleado=usuario.empleado,
        estudiante=usuario.estudiante,
        correousuario=correo_normalizado,
        teleusuario=usuario.teleusuario,
        activo=True
    )
    db.add(nuevo_usuario)
    
    db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

def actualizar_usuario_completo(ciuser: str, usuario_updata: UsuarioUpdata, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = usuario_updata.model_dump(exclude_unset=True)
    if "contrase" in update_data and update_data["contrase"]:
        update_data["contrase"] = hashear_password(update_data["contrase"])

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    # Inyección del admin_id para el Trigger
    db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))

    db.commit()
    db.refresh(db_usuario)
    return db_usuario


def actualizar_usuario_parcial(ciuser: str, usuario_updata: UsuarioUpdata, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    update_data = usuario_updata.model_dump(exclude_unset=True)
    if "contrase" in update_data and update_data["contrase"]:
        update_data["contrase"] = hashear_password(update_data["contrase"])

    for key, value in update_data.items():
        setattr(db_usuario, key, value)

    # Inyección del admin_id para el Trigger
    db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))

    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def eliminar_usuario(ciuser: str, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Desactivar al usuario
    db_usuario.activo = False
    
    # Desactivar TODOS los roles asociados en UserLogin para evitar conflictos posteriores
    db_logins = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo == True).all()
    for login in db_logins:
        login.activo = False
        
    # Inyección del admin_id para el Trigger de auditoría
    db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))

    db.commit()