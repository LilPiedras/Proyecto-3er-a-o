from pydantic import BaseModel, Field
from typing import Optional, Literal

NIVEL_CURSO = Literal["Basico", "Intermedio", "Avanzado"]

class CursoSalida(BaseModel):
    idcurso: int
    nomcurso: str
    preciocurso: int
    nivelcur: str
    docenasig: Optional[str] = None

    class Config:
        from_attributes = True

class CursoEntrada(BaseModel):
    nomcurso: str
    preciocurso: int
    nivelcur: NIVEL_CURSO
    docenasig: Optional[str] = None

class CursoActualizar(BaseModel):
    nomcurso: Optional[str] = None
    preciocurso: Optional[int] = None
    nivelcur: Optional[NIVEL_CURSO] = None
    docenasig: Optional[str] = None