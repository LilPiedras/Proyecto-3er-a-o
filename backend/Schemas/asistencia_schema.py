from pydantic import BaseModel
from typing import Optional
from datetime import date

class AsistenciaSalida(BaseModel):
    asisestu: str
    fecha: date
    verificar: bool

class AsistenciaEntrada(BaseModel):
    asisestu: str
    fecha: date
    verificar: bool = False

class AsistenciaActualizar(BaseModel):
    asisestu: Optional[str] = None
    fecha: Optional[date] = None
    verificar: Optional[bool] = None