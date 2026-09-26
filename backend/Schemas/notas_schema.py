from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class NotasSalida(BaseModel):
    notas: float
    oferta: int
    fechanota: date

class NotasEntrada(BaseModel):
    notas: float = Field(..., ge=0.0, le=20.0, description="La calificación debe estar entre 0.0 y 20.0")
    oferta: int
    fechanota: date

class NotaActualizar(BaseModel):
    notas: Optional[float] = Field(None, ge=0.0, le=20.0)
    oferta: Optional[int] = None
    fechanota: Optional[date] = None
    
class PlanEvaluacionCrear(BaseModel):
    materia: str
    descripcion: str
    porcentaje: float
    fecha_evaluacion: date