from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class OfertaEntrada(BaseModel):
    idcarremo : int
    idsecc : int
    estudiante : str
    horario : Optional[int] | None = None

class OfertaSalida(BaseModel):
    idcarremo : int
    idsecc : int
    estudiante : str
    horario : Optional[int] | None = None

class OfertaActualizar(BaseModel):
    idcarremo: Optional[int] | None = None
    idsecc : Optional[int] | None = None
    estudiante : Optional[str] | None = None
    horario : Optional[int] | None = None
