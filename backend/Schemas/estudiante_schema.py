from pydantic import BaseModel
from datetime import date
from typing import Optional

class EstudianteSalida(BaseModel):
    ciestu : str
    nombreestu : str
    apelliestu : str
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None
    
class EstuEntrada(BaseModel):
    ciestu : str
    nombreestu : str
    apelliestu : str
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None

class EstudianteActualizar(BaseModel):
    nombreestu : Optional[str] | None = None
    apelliestu : Optional[str] | None = None
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None