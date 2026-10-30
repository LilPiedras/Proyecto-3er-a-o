from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import date

class NotasEntrada(BaseModel):
    notas: float = Field(..., ge=0.0, le=20.0, description="Calificación entre 0.0 y 20.0")
    oferta: int
    idevaluacion: Optional[int] = None
    fechanota: date

class NotasSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idnota: int
    notas: float
    oferta: int
    idevaluacion: Optional[int] = None
    fechanota: date
    activo: bool

class NotaActualizar(BaseModel):
    notas: Optional[float] = Field(None, ge=0.0, le=20.0)
    oferta: Optional[int] = None
    idevaluacion: Optional[int] = None
    fechanota: Optional[date] = None

class EstudianteDeMateria(BaseModel):
    idseccmo: int
    ciestu: str
    nombreestu: Optional[str] = None
    apelliestu: Optional[str] = None
    idsecc: int
    horario: Optional[int] = None