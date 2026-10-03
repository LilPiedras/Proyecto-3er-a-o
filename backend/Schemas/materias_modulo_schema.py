from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class MateriaModuloEntrada(BaseModel):
    idmatemo: Optional[int] = None  # <-- Cambiado a opcional para evitar el error 422
    idmateria: int
    idmodulo: int

    class Config:
        from_attributes = True

class MateriaModuloSalida(BaseModel):
    idmatemo: int
    idmateria : int
    idmodulo : int

    class Config:
        from_attributes = True

class MateriaModuloActualizar(BaseModel):
    idmateria: Optional[int] | None = None