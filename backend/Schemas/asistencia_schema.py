from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class AsistenciaSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idasis: int
    asisestu: str
    idmateria: int
    fecha: date
    verificar: bool

class AsistenciaEntrada(BaseModel):
    asisestu: str
    idmateria: int
    fecha: date
    verificar: bool = False

class AsistenciaActualizar(BaseModel):
    verificar: bool

class AsistenciaMateriaSalida(BaseModel):
    idmateria: int
    nombremateria: str

class AsistenciaSeccionSalida(BaseModel):
    idsecc: int
    nomsecc: str

class AsistenciaLoteSalida(BaseModel):
    actualizadas: int

class AsistenciaMarcaEntrada(BaseModel):
    asisestu: str
    verificar: bool

class AsistenciaLoteEntrada(BaseModel):
    idmateria: int
    idsecc: int
    fecha: date
    asistencias: list[AsistenciaMarcaEntrada]

class AsistenciaEstudianteSalida(BaseModel):
    idasis: Optional[int] = None
    asisestu: str
    nombreestu: str
    apelliestu: str
    idmateria: int
    fecha: date
    verificar: Optional[bool] = None