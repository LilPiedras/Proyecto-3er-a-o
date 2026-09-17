from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class NotasSalida(BaseModel):
    notas : int
    oferta : int
    fechanota : date

class NotasEntrada(BaseModel):
    notas : float
    oferta : int
    fechanota : date

class NotaActualizar(BaseModel):
    materia : Optional[str] | None = None
    oferta : Optional[int] | None = None
    fechanota : Optional[date] | None = None