from typing import List, Optional
from pydantic import BaseModel


class ModuloConteo(BaseModel):
    modulo: str
    cantidad: int


class ResumenMensualidades(BaseModel):
    total_registros: int
    pagados: int
    pendientes: int
    monto_recaudado: float


class DashboardResumenResponse(BaseModel):
    rol: int
    total_estudiantes: int
    total_docentes: int
    total_modulos: int
    estudiantes_por_modulo: List[ModuloConteo] = []
    mensualidades: Optional[ResumenMensualidades] = None