from pydantic import BaseModel, Field
from datetime import date
from typing import Optional

class UsuarioSalida(BaseModel):
    ciuser: str
    nombreusuario : str
    apellusuario : str
    teleusuario : str
    estudiante : Optional[str] | None = None
    empleado : Optional[str] | None = None
    correousuario: str
    contrase : str

class UsuarioEntrada(BaseModel):
    ciuser: str
    nombreusuario : str
    apellusuario : str
    teleusuario : str
    estudiante : Optional[str] | None = None
    empleado : Optional[str] | None = None
    correousuario: str
    contrase : str = Field(...,min_length=8, max_length=140)
 

class UsuarioUpdata(BaseModel):
    nombreusuario: Optional[str] | None = None
    apellusuario: Optional[str] | None = None
    teleusuario: Optional[str] | None = None
    estudiante: Optional[str] | None = None
    empleado: Optional[str] | None = None
    correousuario: Optional[str] | None = None
    contrase: Optional[str] | None = None
 