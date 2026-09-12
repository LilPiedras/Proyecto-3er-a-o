from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CursoSalida(BaseModel):
    nomcurso : str
    preciocurso : int
    nivelcur : str
    docenasig : Optional[str] | None = None
    
class CursoEntrada(BaseModel):
    nomcurso : str
    preciocurso : int
    nivelcur : str
    docenasig : Optional[str] | None = None

class CursoActualizar(BaseModel):
    nomcurso : Optional[str] | None = None
    preciocurso : Optional[int] | None = None
    nivelcur : Optional[str] | None = None
    docenasig : Optional[str] | None = None