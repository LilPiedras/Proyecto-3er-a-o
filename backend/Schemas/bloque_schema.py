from pydantic import BaseModel
from typing import Optional
from datetime import time

class BloqueEntrada(BaseModel):
    dia: str
    horainicio: time
    horafin: time

class BloqueSalida(BaseModel):
    idbloque: int
    dia: str
    horainicio: time
    horafin: time

class BloqueActualizar(BaseModel):
    dia: Optional[str] = None
    horainicio: Optional[time] = None
    horafin: Optional[time] = None