from pydantic import BaseModel, Field
from typing import Optional

class HorarioSalida(BaseModel):
    idhorario: int
    dia: str
    bloque: int
    salon: str
    activo: bool | None = None

    class Config:
        from_attributes = True

class HorarioEntrada(BaseModel):
    dia: str = Field(..., min_length=1, max_length=20)
    bloque: int = Field(..., gt=0)
    salon: str = Field(..., min_length=1, max_length=30)

class HorarioActualizar(BaseModel):
    dia: Optional[str] = None
    bloque: Optional[int] = None
    salon: Optional[str] = None