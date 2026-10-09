from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from datetime import date
 
class MetodoPagoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idmetodopago: int
    metodousado : str
    registro : str

class MetodoPagoEntrada(BaseModel):
    metodousado : str
    registro : str
    
class MetodoPagoActualizar(BaseModel):
    metodousado : Optional[str] | None = None
    registro : Optional[str] | None = None
