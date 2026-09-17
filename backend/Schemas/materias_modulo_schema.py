from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class MateriaModuloEntrada(BaseModel):
    idmateria : int
    idmodulo : int

class MateriaModuloSalida(BaseModel):
    idmateria : int
    idmodulo : int


class MateriaModuloActualizar(BaseModel):
    idmateria: Optional[int] | None = None
    idmateria : Optional[int] | None = None
