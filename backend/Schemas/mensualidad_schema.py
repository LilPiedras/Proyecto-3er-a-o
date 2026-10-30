from pydantic import BaseModel, ConfigDict, Field
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


class MensualidadSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idmensualidad: int
    metodopago: int
    monedapago: int
    monto: Decimal
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
    monto: Decimal
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
    monto: Optional[Decimal] = None
    encargado: Optional[str] = None
    verificacion: Optional[bool] = None
    periodo_id: Optional[int] = None
    fecha_corte: Optional[date] = None
    estado: Optional[str] = None
    factura: Optional[str] = Field(default=None, max_length=100)
    fechapago: Optional[date] = None