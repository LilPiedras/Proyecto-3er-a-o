from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class AsignacionDocenteEntrada(BaseModel):
    empleado_id: str                    # cédula (String)
    materia_id: int
    seccion_id: int
    fecha_asignacion: date               # o date, según cómo lo guardes
    horario_id: Optional[int] = None

AsigmentDocEntrada = AsignacionDocenteEntrada


class AsignacionDocenteActualizar(BaseModel):
    empleado_id: Optional[str] = None
    materia_id: Optional[int] = None
    seccion_id: Optional[int] = None
    fecha_asignacion: Optional[date] = None
    horario_id: Optional[int] = None
    activo: Optional[bool] = None

AsigmentDocUpdate = AsignacionDocenteActualizar


class AsignacionDocenteSalida(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_asignacion_docente: int
    empleado_id: str
    materia_id: int
    seccion_id: int
    horario_id: Optional[int] = None
    fecha_asignacion: date
    activo: bool = True

AsigmentDocSalida = AsignacionDocenteSalida


# Respuesta enriquecida para el panel del docente
class AsignacionDocenteDetalle(BaseModel):
    id_asignacion_docente: int
    empleado_id: str
    materia_id: int
    nombremateria: str
    seccion_id: int
    nomsecc: str
    horario_id: Optional[int] = None
    fecha_asignacion: date