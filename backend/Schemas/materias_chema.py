from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class MateriasSalida(BaseModel):
    nombremateria : str
    docente : Optional[str] | None = None

class MateriasEntrada(BaseModel):
    nombremateria : str
    docente : Optional[str] | None = None

class MateriasActualizar(BaseModel):
    nombremateria : Optional[str] | None = None
    docente : Optional[str] | None = None
 