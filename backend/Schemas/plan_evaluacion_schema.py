from pydantic import BaseModel, Field
from decimal import Decimal

class PlanEvaluacionEntrada(BaseModel):
    idmateria: int = Field(..., gt=0)
    idsecc: int = Field(..., gt=0)
    titulo: str = Field(..., min_length=1, max_length=100)
    porcentaje: Decimal = Field(..., ge=0, le=100)

class PlanEvaluacionSalida(PlanEvaluacionEntrada):
    idevaluacion: int

    class Config:
        from_attributes = True