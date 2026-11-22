from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date

class MateriaModuloEntrada(BaseModel):
    idmatemo: Optional[int] = None
    idmateria: int
    idmodulo: int

    class Config:
        from_attributes = True

class MateriaModuloSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    idmatemo: int
    idmateria : int
    idmodulo : int
    nombremateria: str
    nombremodulo: str

class MateriaModuloActualizar(BaseModel):
    idmateria: Optional[int] | None = None