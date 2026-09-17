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