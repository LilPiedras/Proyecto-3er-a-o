from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class Login_UserEntrada(BaseModel):
    ciuser : str
    idrol : int

class Login_UserSalida(BaseModel):
    ciuser : str
    idrol : int

class Login_UserActualizar(BaseModel):
    ciuser: Optional[str] | None = None
    idrol : Optional[int] | None = None

