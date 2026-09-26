from pydantic import BaseModel
from typing import Optional

class OfertaEntrada(BaseModel):
    idcarremo: int
    idsecc: int
    estudiante: str
    horario: Optional[int] = None

class OfertaSalida(BaseModel):
    idseccmo: int
    idcarremo: int
    idsecc: int
    estudiante: str
    horario: Optional[int] = None

class OfertaActualizar(BaseModel):
    idcarremo: Optional[int] = None
    idsecc: Optional[int] = None
    estudiante: Optional[str] = None
    horario: Optional[int] = None
