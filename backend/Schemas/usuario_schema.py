from pydantic import BaseModel, Field
from typing import Optional

class UsuarioEntrada(BaseModel):
    ciuser: str = Field(..., min_length=6, max_length=20)
    nombreusuario: str = Field(..., min_length=2, max_length=20)
    apellusuario: str = Field(..., min_length=2, max_length=100)
    teleusuario: Optional[str] = Field(None, max_length=20)
    estudiante: Optional[str] = Field(None, max_length=30)
    empleado: Optional[str] = Field(None, max_length=30)
    correousuario: str = Field(..., min_length=5, max_length=200)
    contrase: str = Field(..., min_length=8, max_length=140)

class UsuarioUpdata(BaseModel):
    nombreusuario: Optional[str] = Field(None, min_length=2, max_length=20)
    apellusuario: Optional[str] = Field(None, min_length=2, max_length=100)
    teleusuario: Optional[str] = Field(None, max_length=20)
    estudiante: Optional[str] = Field(None, max_length=30)
    empleado: Optional[str] = Field(None, max_length=30)
    correousuario: Optional[str] = Field(None, min_length=5, max_length=200)
    contrase: Optional[str] = Field(None, min_length=8, max_length=140)

class UsuarioSalida(BaseModel):
    ciuser: str
    nombreusuario: str
    apellusuario: str
    teleusuario: Optional[str] = None
    estudiante: Optional[str] = None
    empleado: Optional[str] = None
    correousuario: Optional[str] = None
    # sin contrase