from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class CursoSalida(BaseModel):
    idcurso: int  # Añade el identificador aquí
    nomcurso : str
    preciocurso : int
    nivelcur : str
    docenasig : Optional[str] | None = None
    
    class Config:
        from_attributes = True
    
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