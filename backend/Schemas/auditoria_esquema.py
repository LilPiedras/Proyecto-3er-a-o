from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AuditoriaSalida(BaseModel):
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] | None = None
    datos_nuevos: Optional[str] | None = None
    fecha: date

class AuditoriaEntrada(BaseModel):
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] | None = None
    datos_nuevos: Optional[str] | None = None
    fecha: date

class AuditoriaActualizar(BaseModel):
    usuario_escritor_id: Optional[str] | None = None
    usuario_objeto_id: Optional[str] | None = None
    accion: Optional[str] | None = None
    datos_anteriores: Optional[str] | None = None
    datos_nuevos: Optional[str] | None = None
    fecha: Optional[date] | None = None