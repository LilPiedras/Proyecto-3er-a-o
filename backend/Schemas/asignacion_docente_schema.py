from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class AsignacionDocenteSalida(BaseModel):
    empleado_id : int
    materia_id : int
    seccion_id : int
    fecha_asignacion: date

AsigmentDocSalida = AsignacionDocenteSalida

class AsignacionDocenteEntrada(BaseModel):
    empleado_id : int
    materia_id : int
    seccion_id : int
    fecha_asignacion: date
    
AsigmentDocEntrada = AsignacionDocenteEntrada

class AsignacionDocenteActualizar(BaseModel):
    empleado_id : Optional[int] | None = None
    materia_id : Optional[int] | None = None
    seccion_id : Optional[int] | None = None
    fecha_asignacion: Optional[date] | None = None

AsigmentDocUpdate = AsignacionDocenteActualizar