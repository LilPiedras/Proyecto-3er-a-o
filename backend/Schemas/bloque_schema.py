from pydantic import BaseModel
from typing import Optional

class BloqueEntrada(BaseModel):
    horainicio: str
    horafin: str

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