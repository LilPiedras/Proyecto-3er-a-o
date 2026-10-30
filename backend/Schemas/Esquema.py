from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

class EstudianteSalida(BaseModel):
    ciestu : str
    nombreestu : str
    apelliestu : str
    modulo : int
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None
    
class EstuEntrada(BaseModel):
    ciestu : str
    nombreestu : str
    apelliestu : str
    modulo : int
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None

class EstudianteActualizar(BaseModel):
    nombreestu : Optional[str] | None = None
    apelliestu : Optional[str] | None = None
    modulo : Optional[int] | None = None
    teleestu : Optional[str] | None = None
    correoestu: Optional[str] | None = None

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
    
class AsistenciaSalida(BaseModel):
    asisestu : str
    verificar: bool

class AsistenciaEntrada(BaseModel):
    asisestu : str
    verificar: bool

class AsistenciaActualizar(BaseModel):
    asisestu : Optional[str] | None = None
    verificar: Optional[bool] | None = None
    
class BloqueEntrada(BaseModel):
    dia : str
    horainicio : str
    horafin: str

class BloqueSalida(BaseModel):
    dia : str
    horainicio : str
    horafin: str

class BloqueActualizar(BaseModel):
    dia : Optional[str] | None = None
    horainicio : Optional[str] | None = None
    horafin: Optional[str] | None = None

class CursoSalida(BaseModel):
    nomcurso : str
    preciocurso : int
    nivelcur : str
    docenteasig : str
    
class CursoEntrada(BaseModel):
    nomcurso : str
    preciocurso : int
    nivelcur : str
    docenteasig : str

class CursoActualizar(BaseModel):
    nomcurso : Optional[str] | None = None
    preciocurso : Optional[int] | None = None
    nivelcur : Optional[str] | None = None
    docenteasig : Optional[str] | None = None

class CursoModuloSalida(BaseModel):
    curso : int
    modulo : int
    horario : int
    notas : int

CuMoS = CursoModuloSalida

class CursoModuloEntrada(BaseModel):
    curso : int
    modulo : int
    horario : int
    notas : int

CuMoE = CursoModuloEntrada

class CursoModuloActualizar(BaseModel):
    curso : Optional[int] | None = None
    modulo : Optional[int] | None = None
    horario : Optional[int] | None = None
    notas : Optional[int] | None = None

CuMoA = CursoModuloActualizar

class HorarioSalida(BaseModel):
    dias : str
    materia : int
    bloque : str
    
class HorarioEntrada(BaseModel):
    dias : str
    materia : int
    bloque : str
    
class HorarioActualizar(BaseModel):
    dias : Optional[str] | None = None
    materia : Optional[int] | None = None
    bloque : Optional[str] | None = None

class MateriasSalida(BaseModel):
    nombremateria : str
    modulo : int
    salon : str
    docente : Optional[str] | None = None

class MateriasEntrada(BaseModel):
    nombremateria : str
    modulo : int
    salon : str
    docente : Optional[str] | None = None

class MateriasActualizar(BaseModel):
    nombremateria : Optional[str] | None = None
    modulo : Optional[int] | None = None
    salon : Optional[str] | None = None
    docente : Optional[int] | None = None
 
 
class MontoSalida(BaseModel):
    metodopago : str
    monedapago : str
    monto : int
    verificacion : bool
    encargado: int

class MontoEntrada(BaseModel):
    metodopago : str
    monedapago : str
    monto : int
    verificacion : bool
    encargado: int

class MontoActualizar(BaseModel):
    metodopago : Optional[str] | None = None
    monedapago : Optional[str] | None = None
    monto : Optional[int] | None = None
    verificacion : Optional[bool] | None = None
    encargado: Optional[int] | None = None


class MetodoPagoSalida(BaseModel):
    metodousado : str
    registro : str

class MetodoPagoEntrada(BaseModel):
    metodousado : str
    registro : str



class ModuloSalida(BaseModel):
    nommodulo : str
    materias : str
    seccion : str

class ModuloEntrada(BaseModel):
    nommodulo : str
    materias : str
    seccion : str

class ModuloActualizar(BaseModel):
    nommodulo : Optional[str] | None = None
    materias : Optional[str] | None = None
    seccion : Optional[str] | None = None

class MonedaPagoSalida(BaseModel):
    tipomoneda : str
    montototal : int
    registro : str

class MonedaPagoEntrada(BaseModel):
    tipomoneda : str
    montototal : int
    registro : str

class MonedaPagoActualizar(BaseModel):
    tipomoneda : Optional[str] | None = None
    montototal : Optional[int] | None = None
    registro : Optional[str] | None = None

class Nota(BaseModel):
    idnota : int
    materia : str
    notas : int
    fechanota : date

class NotasSalida(BaseModel):
    notas : int
    materia : int
    fechanota : date

class NotasEntrada(BaseModel):
    notas : float
    materia : int
    fechanota : date

class NotaActualizar(BaseModel):
    materia : Optional[str] | None = None
    notas : Optional[int] | None = None
    fechanota : Optional[date] | None = None

class PreguntasSeguridadSalida(BaseModel):
    preguntas : str
    respuesta : Optional[str] | None = None
    

PreSegSalida = PreguntasSeguridadSalida

class PreguntasSeguridadEntrada(BaseModel):
    preguntas : str
    respuesta : Optional[str] | None = None
    

preSegEntrada = PreguntasSeguridadEntrada

class PreguntasSeguridadActualizar(BaseModel):
    preguntas : Optional[str] | None = None
    respuesta : Optional[str] | None = None

preSegActualizar = PreguntasSeguridadActualizar

class RolSalida(BaseModel):
    nombrerol : str
    descripcion : str

class RolEntrada(BaseModel):
    nombrerol : str
    descripcion : str
    
class Rolactualizar(BaseModel):
    nombrerol : Optional[str] | None = None
    descripcion : Optional[str] | None = None

class SeccionSalida(BaseModel):
    nomsecc : str
    horarios : int

class SeccionEntrada(BaseModel):
    nomsecc : str
    horarios : int

class SeccionActualizar(BaseModel):
    nomsecc: Optional[str] | None = None
    horarios : Optional[int] | None = None

class UsuarioSalida(BaseModel):
    nombreusuario : str
    apellusuario : str
    teleusuario : str
    correousuario: str
    contrase : str

class UsuarioEntrada(BaseModel):
    nombreusuario : str
    apellusuario : str
    teleusuario : str
    correousuario: str
    contrase : str = Field(...,min_length=8, max_length=50)

class UsuarioUpdata(BaseModel):
    nombreusuario : Optional[str] | None = None
    apellusuario : Optional[str] | None = None
    teleusuario : Optional[str] | None = None
    correousuario: Optional[str] | None = None
    contrase : Optional[str] | None = None

class MensualidadSalida (BaseModel):
    idmensualidad : int
    metodopago : int
    monedapago : int
    monto : int
    encargado : int
    verificacion : float

class MensualidadEntrada (BaseModel):
    idmensualidad : int
    metodopago : int
    monedapago : int
    monto : int
    encargado : int
    verificacion : float

