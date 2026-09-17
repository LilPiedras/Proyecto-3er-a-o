from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AsistenciaSalida(BaseModel):
    asisestu : str
    fecha: date
    verificar: bool

class AsistenciaEntrada(BaseModel):
    asisestu : str
    fecha: date
    verificar: bool

class AsistenciaActualizar(BaseModel):
    asisestu : Optional[str] | None = None
    fecha : Optional[date] | None = None
    verificar: Optional[bool] | None = None