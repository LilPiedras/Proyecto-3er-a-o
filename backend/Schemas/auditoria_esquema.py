from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date, time

class AuditoriaSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idseria: int
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: date
    hora: Optional[time] = None

class AuditoriaEntrada(BaseModel):
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: date
    hora: Optional[time] = None

class AuditoriaActualizar(BaseModel):
    usuario_escritor_id: Optional[str] = None
    usuario_objeto_id: Optional[str] = None
    accion: Optional[str] = None
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: Optional[date] = None
    hora: Optional[time] = None