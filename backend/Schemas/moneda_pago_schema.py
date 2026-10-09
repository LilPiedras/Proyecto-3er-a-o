from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date

class MonedaPagoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idmoneda: int
    tipomoneda : str
    montototal : int
    registro : str

class MonedaPagoEntrada(BaseModel):
    tipomoneda : str
    montototal : int
    registro : str

class MonedaPagoActualizar(BaseModel):
    tipomoneda : Optional[str] | None = None
    montototal : Optional[int] | None = None
    registro : Optional[str] | None = None
