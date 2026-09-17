from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class PreguntaUserdSalida(BaseModel):
    ciuser : str
    idpregunta: int
    respuesta: str

class PreguntaUserEntrada(BaseModel):
    ciuser : str
    idpregunta : int
    respuesta : str

class PreguntaUserActualizar(BaseModel):
    ciuser : Optional[str] | None = None
    idpregunta : Optional[int] | None = None
    respuesta : Optional[str] | None = None
