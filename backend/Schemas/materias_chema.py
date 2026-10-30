from pydantic import BaseModel
from typing import Optional

class MateriasSalida(BaseModel):
    idmateria: int          
    nombremateria: str
    docente: Optional[str] | None = None

    class Config:
        from_attributes = True

class MateriasEntrada(BaseModel):
    nombremateria: str
    docente: Optional[str] = "Sin asignar" 

class MateriasActualizar(BaseModel):
    nombremateria: Optional[str] = None
    docente: Optional[str] = None