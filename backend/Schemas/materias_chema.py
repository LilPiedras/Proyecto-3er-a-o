from pydantic import BaseModel, Field
from typing import Optional

class MateriasSalida(BaseModel):
    idmateria: int
    nombremateria: str
    docente: Optional[str] | None = None

    class Config:
        from_attributes = True

class MateriasEntrada(BaseModel):
    nombremateria: str = Field(..., min_length=1, max_length=20)
    docente: Optional[str] = Field(None, max_length=30)

class MateriasActualizar(BaseModel):
    nombremateria: Optional[str] = Field(None, min_length=1, max_length=20)
    docente: Optional[str] = Field(None, max_length=30)