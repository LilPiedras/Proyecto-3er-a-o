from models.preguntas_seguridad_model import *
from models.preguntas_usuario_model import Preguntas_Usuario
from models.usuario_model import Usuario
from Schemas.preguntas_seguridad_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from tokensitos.tokesificador import hashear_password, verificar_password


def listar_preguntas(db: Session):
    pregun = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.activo == True).all()
    if not pregun:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de materias vacia")
    return pregun


def crear_nueva_preguntas(pregun: PreguntasSeguridadEntrada, db: Session):
    pregun = PreguntasSeguridad(
        preguntas=pregun.preguntas,
        respuesta=pregun.respuesta,
        ciuser=pregun.ciuser,
    )
    db.add(pregun)
    db.commit()
    db.refresh(pregun)
    return pregun


def asignar_pregunta_a_usuario(data: dict, db: Session):
    ciuser = data.get("ciuser")
    idpregunta = data.get("idpregunta")
    respuesta = data.get("respuesta")

    if not ciuser or idpregunta is None or not respuesta:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Faltan datos requeridos")

    hashed_respuesta = hashear_password(str(respuesta).strip())

    existente = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == str(ciuser).strip()).first()
    if existente:
        existente.idpregunta = int(idpregunta)
        existente.respuesta = hashed_respuesta
    else:
        nuevo_vinculo = Preguntas_Usuario(
            ciuser=str(ciuser).strip(),
            idpregunta=int(idpregunta),
            respuesta=hashed_respuesta,
        )
        db.add(nuevo_vinculo)

    db.commit()
    return {"mensaje": "Pregunta de seguridad configurada con éxito"}


def obtener_pregunta_por_usuario(ciuser: str, db: Session):
    cedula = ciuser.strip()
    vinculo = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == cedula).first()
    if not vinculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El usuario no tiene una pregunta de seguridad asignada.",
        )

    pregunta = db.query(PreguntasSeguridad).filter(PreguntasSeguridad.idpregunta == vinculo.idpregunta).first()
    if not pregunta:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró la pregunta de seguridad asociada.",
        )

    return {"preguntas": pregunta.preguntas}


def restablecer_password_por_pregunta(data: dict, db: Session):
    ciuser = str(data.get("ciuser", "")).strip()
    respuesta = str(data.get("respuesta", "")).strip()
    nueva_password = data.get("nueva_password")

    if not ciuser or not respuesta or not nueva_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faltan datos requeridos para restablecer la contraseña.",
        )

    vinculo = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == ciuser).first()
    if not vinculo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró una pregunta de seguridad para este usuario.",
        )

    if not verificar_password(respuesta, vinculo.respuesta):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La respuesta secreta es incorrecta.",
        )

    usuario = db.query(Usuario).filter(Usuario.ciuser == ciuser).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado.",
        )

    usuario.contrase = hashear_password(nueva_password)
    db.commit()
    return {"mensaje": "Contraseña restablecida exitosamente."}


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
    db_pregun = db.query(PreguntasSeguridad).filter(
        PreguntasSeguridad.idpregunta == idpregunta,
        PreguntasSeguridad.activo == True,
    ).first()
    if not db_pregun:
        raise HTTPException(status_code=404, detail="La pregunta no existe")

    db_pregun.activo = False
    db.commit()
    return None