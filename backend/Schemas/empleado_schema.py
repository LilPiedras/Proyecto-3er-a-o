from pydantic import BaseModel
from datetime import date
from typing import Optional

class EmpleadoEntrada(BaseModel):
    ciempleado: str
    nombreempleado: str
    apellidoempleado: str
    fechacontra: date
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None

class EmpleadoSalida(BaseModel):
    ciempleado: str
    nombreempleado: str
    apellidoempleado: str
    fechacontra: date
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None

class EmpleadoUpdate(BaseModel):
    nombreempleado: Optional[str] = None
    apellidoempleado: Optional[str] = None
    fechacontra: Optional[date] = None
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None