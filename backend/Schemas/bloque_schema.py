from pydantic import BaseModel, Field
from typing import Optional

class BloqueEntrada(BaseModel):
    horainicio : str
    horafin: str

class BloqueSalida(BaseModel):
    horainicio : str
    horafin: str

class BloqueActualizar(BaseModel):
    horainicio : Optional[str] | None = None
    horafin: Optional[str] | None = None
