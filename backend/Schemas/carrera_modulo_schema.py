from pydantic import BaseModel, ConfigDict
from typing import Optional

class CarreraModuloSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idcarremo: int
    idmatemo: int
    idcarrera: int

class CarreraModuloEntrada(BaseModel):
    idmatemo: int
    idcarrera: int

class CarreraModuloActualizar(BaseModel):
    idmatemo: Optional[int] = None
    idcarrera: Optional[int] = None