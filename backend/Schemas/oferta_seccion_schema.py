from pydantic import BaseModel, ConfigDict
from typing import Optional

class OfertaEntrada(BaseModel):
    idcarrera: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None
    idcarremo: Optional[int] = None

class OfertaSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseccmo: int
    idcarrera: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None
    idcarremo: Optional[int] = None

class OfertaActualizar(BaseModel):
    idcarrera: Optional[int] = None
    idsecc: Optional[int] = None
    horario: Optional[int] = None
    estudiante: Optional[str] = None
    idcarremo: Optional[int] = None

class OfertaEstudianteDetalle(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseccmo: int
    idcarremo: int
    idsecc: int
    horario: Optional[int] = None

class AsignarEstudiante(BaseModel):
    ciestu: str

class OfertaConEstudiante(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseccmo: int
    idcarremo: int
    idsecc: int
    horario: Optional[int] = None
    estudiante: Optional[str] = None