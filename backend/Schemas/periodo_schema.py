from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class PeriodoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    fecha_inicio: date
    fecha_fin: date
    activo: bool = True
    cerrado: bool = False

class PeriodoEntrada(BaseModel):
    nombre: str
    fecha_inicio: date
    fecha_fin: date

class PeriodoActualizar(BaseModel):
    nombre: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    cerrado: Optional[bool] = None