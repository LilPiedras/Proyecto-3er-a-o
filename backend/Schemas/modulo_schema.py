from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class ModuloSalida(BaseModel):
    nombremodulo : str

class ModuloEntrada(BaseModel):
    nombremodulo : str

class ModuloActualizar(BaseModel):
    nombremodulo : Optional[str] | None = None

