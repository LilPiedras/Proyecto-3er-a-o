from pydantic import BaseModel
from typing import Optional

class ModuloSalida(BaseModel):
    idmodulo: int           
    nombremodulo: str         

    class Config:
        from_attributes = True  

class ModuloEntrada(BaseModel):
    nombremodulo: str
    activo: Optional[bool] = True

class ModuloActualizar(BaseModel):
    nombremodulo: Optional[str] = None
    activo: Optional[bool] = None