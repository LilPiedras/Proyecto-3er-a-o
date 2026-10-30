from pydantic import BaseModel
from typing import Optional

class SeccionSalida(BaseModel):
    idsecc: int
    nomsecc: str

    class Config:
        from_attributes = True

class SeccionEntrada(BaseModel):
    nomsecc: str

class SeccionActualizar(BaseModel):
    nomsecc: Optional[str] = None