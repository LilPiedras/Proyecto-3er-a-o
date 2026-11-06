from pydantic import BaseModel, ConfigDict, Field, model_validator
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class DatosEstudianteSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ciestu: str
    nombreestu: str
    apelliestu: str
    teleestu: Optional[str] = None
    correoestu: Optional[str] = None


class MensualidadEstudianteSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    estudiante: str
    periodo_id: int
    fecha_vencimiento: date
    estado: str
    factura: Optional[str] = None
    fechapago: Optional[date] = None
    datos_estudiante: DatosEstudianteSalida


class EstadoMensualidadEstudianteSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    estado: str
    fecha_vencimiento: date


class MensualidadSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idmensualidad: int
    metodopago: int
    monedapago: int
    monto: Decimal
    monto_carreras_usd: Decimal = Decimal("0")
    monto_extra: Decimal = Decimal("0")
    tasa_conversion: Decimal = Decimal("1")
    encargado: Optional[str] = None
    verificacion: bool
    periodo_id: int
    fecha_corte: date
    fecha_creacion: datetime
    estado: str
    activo: bool
    estudiantes_asignados: list[MensualidadEstudianteSalida] = Field(default_factory=list)


class MensualidadEntrada(BaseModel):
    metodopago: int
    monedapago: int
    monto: Optional[Decimal] = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    monto_extra: Decimal = Field(default=Decimal("0"), ge=0, max_digits=12, decimal_places=2)
    tasa_conversion: Decimal = Field(default=Decimal("1"), gt=0, max_digits=12, decimal_places=6)
    verificacion: bool = False
    periodo_id: int
    fecha_corte: date
    estudiante: str
    estado: str = "pendiente"
    factura: Optional[str] = Field(default=None, max_length=100)
    fechapago: Optional[date] = None


class MensualidadActualizar(BaseModel):
    metodopago: Optional[int] = None
    monedapago: Optional[int] = None
    monto: Optional[Decimal] = Field(default=None, gt=0, max_digits=12, decimal_places=2)
    monto_extra: Optional[Decimal] = Field(default=None, ge=0, max_digits=12, decimal_places=2)
    tasa_conversion: Optional[Decimal] = Field(default=None, gt=0, max_digits=12, decimal_places=6)
    encargado: Optional[str] = None
    verificacion: Optional[bool] = None
    periodo_id: Optional[int] = None
    fecha_corte: Optional[date] = None
    estado: Optional[str] = None
    factura: Optional[str] = Field(default=None, max_length=100)
    fechapago: Optional[date] = None

    @model_validator(mode="after")
    def validar_importes_no_nulos(self):
        for campo in ("monto", "monto_extra", "tasa_conversion"):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f"{campo} no puede ser nulo")
        return self