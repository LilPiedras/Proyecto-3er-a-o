from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CursoModuloSalida(BaseModel):
    curso : int
    modulo : int
    horario : int
    notas : int

CuMoS = CursoModuloSalida

class CursoModuloEntrada(BaseModel):
    curso : int
    modulo : int
    horario : int
    notas : int

CuMoE = CursoModuloEntrada

class CursoModuloActualizar(BaseModel):
    curso : Optional[int] | None = None
    modulo : Optional[int] | None = None
    horario : Optional[int] | None = None
    notas : Optional[int] | None = None

CuMoA = CursoModuloActualizar