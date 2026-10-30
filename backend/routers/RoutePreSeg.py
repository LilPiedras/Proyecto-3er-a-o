from database.connection import SessionLocal
from models.preguntas_seguridad_model import *
from Schemas.preguntas_seguridad_schema import *
from services import preguntas_seguridad_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 
from pydantic import BaseModel

pregunta_route = APIRouter(
    prefix="/PreguntasSeguridad",
    tags=["Preguntas de Seguridad"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class AsignarPreguntaSchema(BaseModel):
    ciuser: str
    idpregunta: int
    respuesta: str

class RecuperacionPasswordSchema(BaseModel):
    ciuser: str
    respuesta: str
    nueva_password: str

# Obtener lista de preguntas para el desplegable (Select) del registro
@pregunta_route.get("/", status_code=status.HTTP_200_OK)
def listar_preguntas_catalogo(db: Session = Depends(get_db)):
    return preguntas_seguridad_service.listar_preguntas(db)

# Obtener la pregunta asignada a un usuario para la vista de Olvidé Contraseña
@pregunta_route.get("/usuario/{ciuser}", status_code=status.HTTP_200_OK)
def obtener_pregunta_usuario(ciuser: str, db: Session = Depends(get_db)):
    return preguntas_seguridad_service.obtener_pregunta_por_usuario(ciuser, db)

# Asignar la pregunta y respuesta a un usuario (Paso 3 del Modal)
@pregunta_route.post("/asignar", status_code=status.HTTP_200_OK)
def asignar_pregunta(datos: AsignarPreguntaSchema, db: Session = Depends(get_db)):
    return preguntas_seguridad_service.asignar_pregunta_usuario(
        ciuser=datos.ciuser,
        idpregunta=datos.idpregunta,
        respuesta=datos.respuesta,
        db=db
    )

# Validar respuesta y restablecer contraseña
@pregunta_route.post("/recuperar-password", status_code=status.HTTP_200_OK)
def recuperar_password(datos: RecuperacionPasswordSchema, db: Session = Depends(get_db)):
    return preguntas_seguridad_service.validar_y_recuperar_password(
        ciuser=datos.ciuser,
        respuesta_ingresada=datos.respuesta,
        nueva_password=datos.nueva_password,
        db=db
    )