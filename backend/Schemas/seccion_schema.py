from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class SeccionSalida(BaseModel):
    nomsecc : str

class SeccionEntrada(BaseModel):
    nomsecc : str

class SeccionActualizar(BaseModel):
    nomsecc: Optional[str] | None = None


