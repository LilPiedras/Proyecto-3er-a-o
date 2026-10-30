from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AuditoriaSalida(BaseModel):
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: datetime

class AuditoriaEntrada(BaseModel):
    usuario_escritor_id: str
    usuario_objeto_id: str
    accion: str
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: datetime

class AuditoriaActualizar(BaseModel):
    usuario_escritor_id: Optional[str] = None
    usuario_objeto_id: Optional[str] = None
    accion: Optional[str] = None
    datos_anteriores: Optional[str] = None
    datos_nuevos: Optional[str] = None
    fecha: Optional[datetime] = None