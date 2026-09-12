from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from jose import JWTError
from database.connection import get_db
from models.user_login_model import UserLogin
from models.usuario_model import Usuario  
from models.token_model import RefreshToken
from tokensitos.tokesificador import (
    verificar_password,
    hashear_password,
    crear_access_token,
    crear_refresh_token,
    decodificar_refresh_token,
    decodificar_access_token,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["Autenticación"])

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class RefreshRequest(BaseModel):
    refresh_token: str

class UsuarioCreate(BaseModel):
    ciuser: str
    nombreusuario: str
    apellusuario: str
    contrase: str
    correousuario: str 
    teleusuario: str | None = None
    idrol: int  


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user_bridge = db.query(UserLogin).join(
        Usuario, UserLogin.ciuser == Usuario.ciuser
    ).filter(
        Usuario.correousuario == form_data.username
    ).first()

    if not user_bridge:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )

    usuario_datos = db.query(Usuario).filter(Usuario.ciuser == user_bridge.ciuser).first()

    if not usuario_datos or not verificar_password(form_data.password, usuario_datos.contrase):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user_bridge.activo:
        raise HTTPException(status_code=400, detail="Usuario inactivo")

    correo_actual = usuario_datos.correousuario
    access_token = crear_access_token(data={"sub": correo_actual})
    refresh_token = crear_refresh_token(data={"sub": correo_actual})
    db_refresh = RefreshToken(
        token=refresh_token,
        usuario_log=user_bridge.ciuser_log, 
        expira=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        activo=True
    )
    db.add(db_refresh)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/registro", status_code=201)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    existe = db.query(Usuario).filter(Usuario.correousuario == usuario.correousuario).first()
    if existe:
        raise HTTPException(status_code=400, detail="El usuario ya existe")

    nuevo_usuario = Usuario(
        ciuser=usuario.ciuser,
        nombreusuario=usuario.nombreusuario,
        apellusuario=usuario.apellusuario,
        contrase=hashear_password(usuario.contrase),
        correousuario=usuario.correousuario,
        teleusuario=usuario.teleusuario,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario) 

    nuevo_login = UserLogin(
        ciuser=nuevo_usuario.ciuser, 
        idrol=usuario.idrol,
        activo=True
    )
    db.add(nuevo_login)
    db.commit()
    db.refresh(nuevo_login)

    return {"mensaje": "Usuario creado correctamente", "id_login": nuevo_login.ciuser_log}


@router.post("/refresh", response_model=Token)
def renovar_token(body: RefreshRequest, db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Refresh token inválido o expirado"
    )
    try:
        payload = decodificar_refresh_token(body.refresh_token)
        correo: str = payload.get("sub")
        tipo: str = payload.get("type")
        if correo is None or tipo != "refresh":
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == body.refresh_token,
        RefreshToken.activo == True
    ).first()

    if not db_token or db_token.expira < datetime.now(timezone.utc):
        raise credentials_exception

    user_bridge = db.query(UserLogin).join(
        Usuario, UserLogin.ciuser == Usuario.ciuser
    ).filter(
        Usuario.correousuario == correo
    ).first()

    if not user_bridge or not user_bridge.activo:
        raise credentials_exception
        
    db_token.activo = False
    db.commit()

    new_access = crear_access_token(data={"sub": correo})
    new_refresh = crear_refresh_token(data={"sub": correo})

    nuevo_db_refresh = RefreshToken(
        token=new_refresh,
        usuario_log=user_bridge.ciuser_log,  
        expira=datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        activo=True
    )
    db.add(nuevo_db_refresh)
    db.commit()

    return {
        "access_token": new_access,
        "refresh_token": new_refresh,
        "token_type": "bearer"
    }


@router.post("/logout")
def logout(body: RefreshRequest, db: Session = Depends(get_db)):
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == body.refresh_token,
        RefreshToken.activo == True
    ).first()
    if db_token:
        db_token.activo = False
        db.commit()
    return {"mensaje": "Sesión cerrada correctamente"}