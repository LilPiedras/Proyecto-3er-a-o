from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class MensualidadSalida (BaseModel):
    metodopago : int
    monedapago : int
    monto : int
    encargado : int
    verificacion : float

class MensualidadEntrada (BaseModel):
    metodopago : int
    monedapago : int
    monto : int
    encargado : int
    verificacion : float

class MensualidadActualizar (BaseModel):
    metodopago : Optional[int] | None = None
    monedapago : Optional[int] | None = None
    monto : Optional[int] | None = None
    encargado : Optional[int] | None = None
    verificacion : Optional[float] | None = None