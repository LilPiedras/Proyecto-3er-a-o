from pydantic import BaseModel
from typing import Optional

class HorarioSalida(BaseModel):
    idhorario: int
    dia: str
    bloque: int
    salon: str

class HorarioEntrada(BaseModel):
    dia: str
    bloque: int
    salon: str

class HorarioActualizar(BaseModel):
    dia: Optional[str] = None
    bloque: Optional[int] = None
    salon: Optional[str] = None