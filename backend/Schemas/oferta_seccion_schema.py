from pydantic import BaseModel, ConfigDict
from typing import Optional


class OfertaEntrada(BaseModel):
    idcarremo: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None


class OfertaSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseccmo: int
    idcarremo: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None


class OfertaActualizar(BaseModel):
    idcarremo: Optional[int] = None
    idsecc: Optional[int] = None
    horario: Optional[int] = None
    estudiante: Optional[str] = None


class OfertaEstudianteDetalle(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseccmo: int
    idcarremo: int
    idsecc: int
    horario: Optional[int] = None