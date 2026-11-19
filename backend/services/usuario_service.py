from models.usuario_model import Usuario
from models.user_login_model import UserLogin
from models.preguntas_usuario_model import Preguntas_Usuario
from Schemas.usuario_schema import UsuarioEntrada, UsuarioUpdata
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password 
from sqlalchemy import func, text

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
    
    usuario_existente = db.query(Usuario).filter(Usuario.ciuser == usuario.ciuser).first()
    
    if usuario_existente:
        if not usuario_existente.activo:
            usuario_existente.activo = True
            usuario_existente.nombreusuario = usuario.nombreusuario
            usuario_existente.apellusuario = usuario.apellusuario
            usuario_existente.contrase = hashear_password(usuario.contrase)
            usuario_existente.correousuario = correo_normalizado
            usuario_existente.teleusuario = usuario.teleusuario
            usuario_existente.empleado = usuario.empleado
            usuario_existente.estudiante = usuario.estudiante
            
            db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
            db.commit()
            db.refresh(usuario_existente)
            return usuario_existente
        else:
            raise HTTPException(status_code=400, detail="El usuario ya existe y se encuentra activo")

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
    
    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
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

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
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

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
    db.commit()
    db.refresh(db_usuario)
    return db_usuario

def eliminar_usuario(ciuser: str, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not db_usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # 1. Desactivar usuario principal
    db_usuario.activo = False
    
    # 2. Desactivar roles asociados en UserLogin
    db_logins = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo == True).all()
    for login in db_logins:
        login.activo = False

    # 3. Desactivar pregunta de seguridad en Preguntas_Usuario (si aplica)
    db_preguntas = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).all()
    for preg in db_preguntas:
        if hasattr(preg, "activo"):
            preg.activo = False
        
    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
    db.commit()

def listar_usuarios_inactivos(db: Session):
    usuarios = db.query(Usuario).filter(Usuario.activo == False).all()
    if not usuarios:
        return []
    return usuarios

def restaurar_usuario(ciuser: str, admin_id: str, db: Session):
    db_usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == False).first()
    if not db_usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no existe en la papelera o ya se encuentra activo"
        )
    
    # 1. Restaurar usuario principal
    db_usuario.activo = True
    
    # 2. Restaurar todos los roles asociados en UserLogin
    db_logins = db.query(UserLogin).filter(UserLogin.ciuser == ciuser).all()
    for login in db_logins:
        login.activo = True

    # 3. Restaurar pregunta de seguridad en Preguntas_Usuario (si aplica)
    db_preguntas = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).all()
    for preg in db_preguntas:
        if hasattr(preg, "activo"):
            preg.activo = True

    db.execute(text("SET LOCAL app.current_admin_id = :admin_id"), {"admin_id": admin_id})
    db.commit()
    db.refresh(db_usuario)
    return db_usuario