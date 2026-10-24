from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date

class PeriodoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre : str
    fecha_inicio : date
    fecha_fin : date

class PeriodoEntrada(BaseModel):
    nombre : str
    fecha_inicio : date
    fecha_fin : date

class PeriodoActualizar(BaseModel):
    nombre : Optional[str] | None = None
    fecha_inicio : Optional[date] | None = None
    fecha_fin : Optional[date] | None = None
