from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CarreraModuloSalida(BaseModel):
    idmatemo : int
    idcarrera: int

class CarreraModuloEntrada(BaseModel):
    idmatemo : int
    idcarrera: int

class CarreraModuloActualizar(BaseModel):
    idmatemo : Optional[int] | None = None
    idcarrera : Optional[int] | None = None