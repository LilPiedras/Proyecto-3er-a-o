from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class CarreraSalida(BaseModel):
    nombrecarrera : str
    descripcion : str
   
class CarreraEntrada(BaseModel):
    nombrecarrera : str
    descripcion : str

class CarreraUpdata(BaseModel):
    nombrecarrera : Optional[str] | None = None
    descripcion : Optional[str] | None = None
    