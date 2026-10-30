<<<<<<< HEAD
from models.preguntas_seguridad_model import PreguntasSeguridad
from models.preguntas_usuario_model import Preguntas_Usuario
from models.usuario_model import Usuario
from Schemas.preguntas_seguridad_schema import PreguntasSeguridadEntrada, PreguntasSeguridadActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password, verificar_password

def listar_preguntas(db: Session):
    pregun = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.activo == True).all()
    # Retorna lista vacía en lugar de 404 para permitir respaldos limpios en el frontend
    return pregun if pregun else []

def obtener_pregunta_por_usuario(ciuser: str, db: Session):
    pregunta_user = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).first()
    if not pregunta_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Este usuario no tiene configurada una pregunta de seguridad.")
    
    pregunta_catalogo = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.idpregunta == pregunta_user.idpregunta).first()
    if not pregunta_catalogo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La pregunta asociada ya no está disponible.")

    return {
        "idpregunta": pregunta_catalogo.idpregunta,
        "preguntas": pregunta_catalogo.preguntas,
        "ciuser": ciuser
    }

def asignar_pregunta_usuario(ciuser: str, idpregunta: int, respuesta: str, db: Session):
    # Hashear la respuesta normalizada (minúsculas y sin espacios extra)
    respuesta_segura = hashear_password(respuesta.strip().lower())

    existente = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).first()
    if existente:
        existente.idpregunta = idpregunta
        existente.respuesta = respuesta_segura
        db.commit()
        db.refresh(existente)
        return existente

    nueva_relacion = Preguntas_Usuario(
        ciuser=ciuser,
        idpregunta=idpregunta,
        respuesta=respuesta_segura
    )
    db.add(nueva_relacion)
    db.commit()
    db.refresh(nueva_relacion)
    return nueva_relacion

def validar_y_recuperar_password(ciuser: str, respuesta_ingresada: str, nueva_password: str, db: Session):
    pregunta_user = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).first()
    if not pregunta_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró una pregunta de seguridad para este usuario.")

    # Verificar respuesta comparándola con el hash
    es_valida = verificar_password(respuesta_ingresada.strip().lower(), pregunta_user.respuesta)
    if not es_valida:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La respuesta de seguridad es incorrecta.")

    usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser, Usuario.activo == True).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado o inactivo.")

    usuario.contrase = hashear_password(nueva_password)
    db.commit()
    return {"mensaje": "Contraseña restablecida exitosamente."}
=======
from models.preguntas_seguridad_model import *
from Schemas.preguntas_seguridad_schema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def listar_preguntas(db: Session):
    pregun = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.activo == True).all()
    if not pregun:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de materias vacia")
    return pregun

def crear_nueva_preguntas(pregun: PreguntasSeguridadEntrada, db:Session):
    pregun = PreguntasSeguridad(preguntas  = pregun.preguntas,
                     respuesta = pregun.respuesta,
                     ciuser = pregun.ciuser)
    db.add(pregun)
    db.commit()
    db.refresh(pregun)
    return pregun

def actualizar_preguntas_parcial(idpregunta: int, pregun_update: PreguntasSeguridadActualizar, db: Session):
    db_pregun = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.idpregunta == idpregunta).first()
    if not db_pregun:
        raise HTTPException(status_code=404, detail="La pregunta/respuesta no existe")

    update_data = pregun_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_pregun, key, value)

    db.commit()
    db.refresh(db_pregun)
    return db_pregun

def eliminar_pregunta(idpregunta: int, db: Session):
    db_pregun = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.idpregunta == idpregunta, PreguntasSeguridad.activo==True).first()
    if not db_pregun:
        raise HTTPException(status_code=404, detail="La pregunta no existe")

    db_pregun.activo = False
    db.commit()
    return None
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
