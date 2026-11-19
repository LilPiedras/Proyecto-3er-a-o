from pydantic import BaseModel, Field, ConfigDict
from datetime import date
from typing import Optional

class EmpleadoEntrada(BaseModel):
    ciempleado: str = Field(..., min_length=6, max_length=30)
    nombreempleado: str = Field(..., min_length=2, max_length=100)
    apellidoempleado: str = Field(..., min_length=2, max_length=100)
    fechacontra: date
    telefempleado: Optional[str] = Field(None, max_length=20)
    correoempleado: Optional[str] = Field(None, max_length=200)
    cargo: Optional[str] = Field(None, max_length=40)

class EmpleadoUpdate(BaseModel):
    nombreempleado: Optional[str] = Field(None, min_length=2, max_length=100)
    apellidoempleado: Optional[str] = Field(None, min_length=2, max_length=100)
    fechacontra: Optional[date] = None
    telefempleado: Optional[str] = Field(None, max_length=20)
    correoempleado: Optional[str] = Field(None, max_length=200)
    cargo: Optional[str] = Field(None, max_length=40)

class EmpleadoSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    ciempleado: str
    nombreempleado: str
    apellidoempleado: str
    fechacontra: date
    telefempleado: Optional[str] = None
    correoempleado: Optional[str] = None
    cargo: Optional[str] = None