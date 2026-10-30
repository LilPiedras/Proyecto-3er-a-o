from pydantic import BaseModel
from decimal import Decimal

class PlanEvaluacionEntrada(BaseModel):
    idmateria: int
    idsecc: int
    titulo: str
    porcentaje: Decimal

class PlanEvaluacionSalida(PlanEvaluacionEntrada):
    idevaluacion: int

    class Config:
        from_attributes = True