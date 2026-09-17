from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PreguntasSeguridadSalida(BaseModel):
    preguntas : str

PreSegSalida = PreguntasSeguridadSalida

class PreguntasSeguridadEntrada(BaseModel):
    preguntas : str
    
preSegEntrada = PreguntasSeguridadEntrada

class PreguntasSeguridadActualizar(BaseModel):
    preguntas : Optional[str] | None = None

preSegActualizar = PreguntasSeguridadActualizar
