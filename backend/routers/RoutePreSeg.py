from database.connection import SessionLocal
from models.preguntas_seguridad_model import *
from Schemas.preguntas_seguridad_schema import *
from services import preguntas_seguridad_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

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
def listar_nota(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.listar_preguntas(db)

@pregunta_route.post("/", response_model=PreguntasSeguridadEntrada, status_code=status.HTTP_200_OK)
def crear_notas(pregun: PreguntasSeguridadEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.crear_nueva_preguntas(pregun, db)

@pregunta_route.patch("/{idpregunta}", response_model=PreguntasSeguridadSalida)
def update_preguntas_seguridad_parcial(idpregunta: int, papu_up: PreguntasSeguridadActualizar, db: Session = Depends(get_db),
                                        current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.actualizar_preguntas_parcial(idpregunta, papu_up, db)

@pregunta_route.delete("/{idpregunta}", status_code=status.HTTP_204_NO_CONTENT)
def delete_preguntas_logico(idpregunta: int, db: Session = Depends(get_db), 
                             current_user: Usuario = Depends(VerificarRoles([1]))):
    return preguntas_seguridad_service.eliminar_pregunta(idpregunta, db)