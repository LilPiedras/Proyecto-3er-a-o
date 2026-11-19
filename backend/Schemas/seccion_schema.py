from pydantic import BaseModel, Field
from typing import Optional

class SeccionSalida(BaseModel):
    idsecc: int
    nomsecc: str

    class Config:
        from_attributes = True

class SeccionEntrada(BaseModel):
    nomsecc: str = Field(..., min_length=1, max_length=10)

class SeccionActualizar(BaseModel):
    nomsecc: Optional[str] = Field(None, min_length=1, max_length=10)