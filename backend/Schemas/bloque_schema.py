from pydantic import BaseModel, Field
from typing import Optional

class BloqueEntrada(BaseModel):
    horainicio: str = Field(..., min_length=4, max_length=8)  # ej "08:00"
    horafin: str = Field(..., min_length=4, max_length=8)

class BloqueSalida(BaseModel):
    idbloque: int
    horainicio: str
    horafin: str
    activo: bool | None = None

    class Config:
        from_attributes = True

class BloqueActualizar(BaseModel):
    horainicio: Optional[str] = None
    horafin: Optional[str] = None