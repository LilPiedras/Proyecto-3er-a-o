from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class CarreraSalida(BaseModel):
    idcarrera: int  # <--- LÍNEA QUE FALTABA
    nombrecarrera : str
    descripcion : str

    class Config:
        from_attributes = True
       
class CarreraEntrada(BaseModel):
    nombrecarrera : str = Field(max_length=90)
    descripcion : str

class CarreraUpdata(BaseModel):
    nombrecarrera : Optional[str] | None = Field(default=None, max_length=90)
    descripcion : Optional[str] | None = None