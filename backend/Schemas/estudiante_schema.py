from pydantic import BaseModel, Field
from typing import Optional

class EstuEntrada(BaseModel):
    ciestu: str = Field(..., min_length=6, max_length=30)
    nombreestu: str = Field(..., min_length=2, max_length=100)
    apelliestu: str = Field(..., min_length=2, max_length=100)
    teleestu: Optional[str] = Field(None, max_length=20)
    correoestu: Optional[str] = Field(None, max_length=200)

class EstudianteActualizar(BaseModel):
    nombreestu: Optional[str] = Field(None, min_length=2, max_length=100)
    apelliestu: Optional[str] = Field(None, min_length=2, max_length=100)
    teleestu: Optional[str] = Field(None, max_length=20)
    correoestu: Optional[str] = Field(None, max_length=200)

class EstudianteSalida(BaseModel):
    ciestu: str
    nombreestu: str
    apelliestu: str
    teleestu: Optional[str] = None
    correoestu: Optional[str] = None