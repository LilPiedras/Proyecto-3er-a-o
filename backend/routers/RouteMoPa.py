from database.connection import SessionLocal
from models.metodo_pago_model import *
from Schemas.metodo_pago_schema import *
from services import metodo_pago_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

metodo_route = APIRouter(
    prefix="/ Metodo Pago",
    tags=["Metodo de Pago"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@metodo_route.get("/", response_model=List[MetodoPagoSalida], status_code=status.HTTP_200_OK)
def listar_metodo_pago(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return metodo_pago_service.listar_metodos(db)

@metodo_route.post("/", response_model=MetodoPagoEntrada, status_code=status.HTTP_200_OK)
def crear_metodo(metodo: MetodoPagoEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return metodo_pago_service.crear_metodo(metodo, db)

@metodo_route.patch("/{idmetodopago}", response_model=MetodoPagoSalida)
def updata_paginho(idmetodopago: int, metodinho: MetodoPagoActualizar, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return metodo_pago_service.actualizar_metodos(idmetodopago, metodinho, db)
