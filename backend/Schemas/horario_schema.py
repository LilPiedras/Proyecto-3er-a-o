from pydantic import BaseModel
from typing import Optional

class HorarioEntrada(BaseModel):
    dia: str
    bloque: int
    salon: str

class HorarioSalida(BaseModel):
    idhorario: int
    dia: str
    bloque: int
    salon: str
    activo: bool | None = None

    class Config:
        from_attributes = True

class HorarioActualizar(BaseModel):
    dia: Optional[str] = None
    bloque: Optional[int] = None
    salon: Optional[str] = None