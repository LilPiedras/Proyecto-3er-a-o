from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class MensualidadEstuEntrada(BaseModel):
    estudiante : str
    fechapago : date
    factura: str

class MensualidadEstuSalida(BaseModel):
    estudiante : str
    fechapago : date
    factura: str

class MensualidadEstuActualizar(BaseModel):
    estudiante: Optional[str] | None = None
    fechapago : Optional[date] | None = None
    factura : Optional[str] | None = None
