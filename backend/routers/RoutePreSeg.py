from database.connection import SessionLocal
from models.preguntas_seguridad_model import *
from models.preguntas_usuario_model import Preguntas_Usuario
from Schemas.preguntas_seguridad_schema import *
from services import preguntas_seguridad_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 
from tokensitos.tokesificador import hashear_password

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

@pregunta_route.get("/", response_model=List[PreguntasSeguridadSalida], status_code=status.HTTP_200_OK)
def listar_nota(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.listar_preguntas(db)

@pregunta_route.post("/", response_model=PreguntasSeguridadEntrada, status_code=status.HTTP_200_OK)
def crear_notas(pregun: PreguntasSeguridadEntrada, db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.crear_nueva_preguntas(pregun, db)

@pregunta_route.post("/asignar", status_code=status.HTTP_201_CREATED)
@pregunta_route.post("/asignar/", status_code=status.HTTP_201_CREATED)
def asignar_pregunta_usuario(data: dict, db: Session = Depends(get_db)):
    print("DATOS CRUDOS RECIBIDOS:", data)
    
    ciuser = data.get("ciuser")
    idpregunta = data.get("idpregunta")
    respuesta = data.get("respuesta")
    
    if not ciuser or idpregunta is None or not respuesta:
        raise HTTPException(status_code=400, detail="Faltan datos requeridos")

    hashed_respuesta = hashear_password(str(respuesta).strip())
    
    existente = db.query(Preguntas_Usuario).filter(Preguntas_Usuario.ciuser == str(ciuser)).first()
    if existente:
        existente.idpregunta = int(idpregunta)
        existente.respuesta = hashed_respuesta
    else:
        nuevo_vinculo = Preguntas_Usuario(
            ciuser=str(ciuser),
            idpregunta=int(idpregunta),
            respuesta=hashed_respuesta
        )
        db.add(nuevo_vinculo)
        
    db.commit()
    return {"mensaje": "Pregunta de seguridad configurada con éxito"}

@pregunta_route.patch("/{idpregunta}", response_model=PreguntasSeguridadSalida)
def update_preguntas_seguridad_parcial(idpregunta: int, papu_up: PreguntasSeguridadActualizar, db: Session = Depends(get_db),
                                        current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.actualizar_preguntas_parcial(idpregunta, papu_up, db)

@pregunta_route.delete("/{idpregunta}", status_code=status.HTTP_204_NO_CONTENT)
def delete_preguntas_logico(idpregunta: int, db: Session = Depends(get_db), 
                             current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.eliminar_pregunta(idpregunta, db)