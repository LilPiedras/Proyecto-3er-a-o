from typing import Union
from pydantic import BaseModel


class AsignacionSchema(BaseModel):
    idmateria: Union[int, str]
    ciempleado: Union[int, str]
    idmodulo: Union[int, str]
    idhorario: Union[int, str]
    idcarrera: Union[int, str]
    idsecc: Union[int, str]