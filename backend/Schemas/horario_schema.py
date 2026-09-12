from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class HorarioSalida(BaseModel):
    dia : str
    bloque : str
    salon : str
    
class HorarioEntrada(BaseModel):
    dia : str
    bloque : str
    salon :str
    
class HorarioActualizar(BaseModel):
    dia : Optional[str] | None = None
    bloque : Optional[str] | None = None
    salon : Optional[str] | None = None
