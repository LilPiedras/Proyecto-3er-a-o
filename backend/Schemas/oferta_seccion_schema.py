from pydantic import BaseModel
from typing import Optional

class OfertaEntrada(BaseModel):
    idcarrera: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None  # Opcional para que el director cree la oferta base

class OfertaSalida(BaseModel):
    idseccmo: int
    idcarrera: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None

    class Config:
        from_attributes = True

class OfertaActualizar(BaseModel):
    idcarrera: Optional[int] = None
    idsecc: Optional[int] = None
    horario: Optional[int] = None
    estudiante: Optional[str] = None

from pydantic import BaseModel
from typing import Optional

class OfertaEstudianteDetalle(BaseModel):
    idseccmo: int
    idcarrera: int
    idsecc: int
    horario: Optional[int] = None

    class Config:
        from_attributes = True  # O orm_mode = True si usas Pydantic v1