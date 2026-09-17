from database.connection import SessionLocal
from models.moneda_pago_model import *
from Schemas.moneda_pago_schema import *
from services import moneda_pago_service
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status
from typing import List
from models.usuario_model import Usuario     
from tokensitos.auth_depencias import VerificarRoles 

monedas_route = APIRouter(
    prefix="/Moneda Pago",
    tags=["Moneda de Pago"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@monedas_route.get("/", response_model=List[MonedaPagoSalida], status_code=status.HTTP_200_OK)
def listar_moneda_pago(db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return moneda_pago_service.listar_judios(db)

@monedas_route.post("/", response_model=MonedaPagoEntrada, status_code=status.HTTP_200_OK)
def crear_moneda(moneda: MonedaPagoEntrada, db:Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return moneda_pago_service.crear_judios(moneda, db)

@monedas_route.patch("/{idmoneda}", response_model=MonedaPagoSalida)
def updata_moneditas(idmoneda: int, judio: MonedaPagoActualizar, db: Session = Depends(get_db),  current_user: Usuario = Depends(VerificarRoles([1]))):
    return moneda_pago_service.actualizar_judios(idmoneda, judio, db)
