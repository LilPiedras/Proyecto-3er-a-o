from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class EmpleadoEntrada(BaseModel):
    ciempleado: str
    nombreempleado: str
    apellidoempleado: str
    fechacontra: Optional[date] = None  # <-- Cambiado a opcional
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None
    cargo: Optional[str] = None

class EmpleadoSalida(BaseModel):
    ciempleado: str
    nombreempleado: str
    apellidoempleado: str
    fechacontra: date
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None
    cargo: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)  # <-- Vital para leer objetos de SQLAlchemy

class EmpleadoUpdate(BaseModel):
    nombreempleado: Optional[str] = None
    apellidoempleado: Optional[str] = None # (Ojo aquí con el tipo de dato si era date)
    fechacontra: Optional[date] = None
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None
    cargo: Optional[str] = None