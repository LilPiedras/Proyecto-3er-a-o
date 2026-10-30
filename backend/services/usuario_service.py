from models.usuario_model import Usuario
from models.user_login_model import UserLogin
from Schemas.usuario_schema import UsuarioEntrada, UsuarioUpdata
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password 
from sqlalchemy import text # Agregado para enviar el ID al trigger de PostgreSQL

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
<<<<<<< HEAD
    # Verificar si el correo ya pertenece a otro usuario diferente
    existe_correo = db.query(Usuario).filter(
        Usuario.correousuario == usuario.correousuario, 
        Usuario.ciuser != usuario.ciuser
    ).first()
    if existe_correo:
        raise HTTPException(status_code=400, detail="El correo electrónico ya está registrado por otro usuario.")

    # Buscar si la cédula ya existe en la base de datos (activa o inactiva)
    usuario_existente = db.query(Usuario).filter(Usuario.ciuser == usuario.ciuser).first()

    if usuario_existente:
        if usuario_existente.activo:
            raise HTTPException(status_code=400, detail="El usuario ya existe y se encuentra activo en el sistema.")
        else:
            # REACTIVAR: El usuario fue dado de baja antes, lo actualizamos y activamos de nuevo
            usuario_existente.nombreusuario = usuario.nombreusuario
            usuario_existente.apellusuario = usuario.apellusuario
            usuario_existente.contrase = hashear_password(usuario.contrase)
            usuario_existente.empleado = usuario.empleado
            usuario_existente.estudiante = usuario.estudiante
            usuario_existente.correousuario = usuario.correousuario
            usuario_existente.teleusuario = usuario.teleusuario
            usuario_existente.activo = True

            # Reactivar también su login asociado si existía previamente
            db_login = db.query(UserLogin).filter(UserLogin.ciuser == usuario.ciuser).first()
            if db_login:
                db_login.activo = True

            # Inyectar el admin_id para la auditoría del trigger
            db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))
            db.commit()
            db.refresh(usuario_existente)
            return usuario_existente

    # Si no existe en absoluto, crearlo normalmente como nuevo
=======
    existe = db.query(Usuario).filter(Usuario.correousuario == usuario.correousuario).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
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
    
<<<<<<< HEAD
    # Inyectar el admin_id para el Trigger de PostgreSQL
=======
    # Le pasamos a PostgreSQL el ID del administrador antes del commit para el Trigger
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
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

<<<<<<< HEAD
    # Desactivar lógicamente al usuario
    db_usuario.activo = False
    
    # Desactivar TODOS los roles activos asociados a esta cédula en user_login
    db_logins = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo == True).all()
    for db_login in db_logins:
        db_login.activo = False
        
    # Inyección del admin_id para el Trigger de auditoría de PostgreSQL
=======
    db_usuario.activo = False
    db_login = db.query(UserLogin).filter(UserLogin.ciuser == ciuser, UserLogin.activo == True).first()
    if db_login:
        db_login.activo = False
        
    # Inyección del admin_id para el Trigger (quedará registrado como UPDATE por cambiar activo a False)
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
    db.execute(text(f"SET LOCAL app.current_admin_id = '{admin_id}'"))

    db.commit()
    return None