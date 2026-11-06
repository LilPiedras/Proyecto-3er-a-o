from pydantic import BaseModel, Field, field_validator
from decimal import Decimal
from typing import Optional

class CarreraSalida(BaseModel):
    idcarrera: int
    nombrecarrera : str
    descripcion : str
    precio_usd: Decimal

    class Config:
        from_attributes = True
       
class CarreraEntrada(BaseModel):
    nombrecarrera : str = Field(max_length=90)
    descripcion : str
    precio_usd: Decimal = Field(ge=0, max_digits=12, decimal_places=2)

class CarreraUpdata(BaseModel):
    nombrecarrera : Optional[str] | None = Field(default=None, max_length=90)
    descripcion : Optional[str] | None = None
    precio_usd: Optional[Decimal] | None = Field(default=None, ge=0, max_digits=12, decimal_places=2)

    @field_validator("precio_usd")
    @classmethod
    def precio_no_nulo(cls, value: Optional[Decimal]) -> Optional[Decimal]:
        if value is None:
            raise ValueError("El precio no puede ser nulo")
        return value