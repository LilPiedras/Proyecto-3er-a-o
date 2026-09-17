from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class RolSalida(BaseModel):
    nombrerol : str
    descripcion : str

class RolEntrada(BaseModel):
    nombrerol : str
    descripcion : str
    
class Rolactualizar(BaseModel):
    nombrerol : Optional[str] | None = None
    descripcion : Optional[str] | None = None