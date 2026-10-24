from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class SeccionInscripcionSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idsecc: int
    nomsecc: str


class DetalleInscripcionSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seccion_id: int
    seccion_rel: SeccionInscripcionSalida


class InscripcionSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    ciestu: str
    periodo_id: int
    fecha_inscripcion: date
    estado: str
    detalles: list[DetalleInscripcionSalida] = Field(default_factory=list)


class InscripcionCrear(BaseModel):
    ciestu: str = Field(min_length=1, max_length=30)
    periodo_id: int = Field(gt=0)
    seccion_id: int | None = Field(default=None, gt=0)
    seccion_ids: list[int] | None = Field(default=None, min_length=1)
    estado: Literal["ACTIVO", "PENDIENTE"] = "ACTIVO"

    @field_validator("ciestu")
    @classmethod
    def limpiar_cedula(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Debe indicar la identificación del estudiante")
        return value

    @model_validator(mode="after")
    def validar_secciones(self):
        if self.seccion_id is None and not self.seccion_ids:
            raise ValueError("Debe indicar al menos una sección")
        if self.seccion_id is not None and self.seccion_ids is not None:
            raise ValueError("Use seccion_id o seccion_ids, no ambos")
        if self.seccion_ids is not None and len(set(self.seccion_ids)) != len(self.seccion_ids):
            raise ValueError("No se puede repetir una sección en la misma solicitud")
        return self

    @property
    def secciones_solicitadas(self) -> list[int]:
        if self.seccion_ids is not None:
            return self.seccion_ids
        return [self.seccion_id] if self.seccion_id is not None else []


class InscripcionReemplazo(BaseModel):
    ciestu: str = Field(min_length=1, max_length=30)
    periodo_id: int = Field(gt=0)
    fecha_inscripcion: date
    estado: Literal["ACTIVO", "PENDIENTE"]

    @field_validator("ciestu")
    @classmethod
    def limpiar_cedula(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Debe indicar la identificación del estudiante")
        return value


class InscripcionActualizar(BaseModel):
    ciestu: str | None = Field(default=None, min_length=1, max_length=30)
    periodo_id: int | None = Field(default=None, gt=0)
    fecha_inscripcion: date | None = None
    estado: Literal["ACTIVO", "PENDIENTE"] | None = None

    @model_validator(mode="after")
    def validar_campos(self):
        if not self.model_fields_set:
            raise ValueError("Debe indicar al menos un campo para actualizar")
        if any(getattr(self, campo) is None for campo in self.model_fields_set):
            raise ValueError("Los campos enviados para actualizar no pueden ser nulos")
        if self.ciestu is not None:
            self.ciestu = self.ciestu.strip()
            if not self.ciestu:
                raise ValueError("Debe indicar la identificación del estudiante")
        return self
