from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String, DateTime)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from database.connection import engine #importacion directa de la connecion a postgres
from datetime import datetime
class Base(DeclarativeBase):
    pass

#  Cliente
 
class Empleado(Base):
    __tablename__ = "empleado"
 
    ciempleado: Mapped[str] = mapped_column(String, primary_key=True, unique=True)
    nombreempleado: Mapped[str] = mapped_column(String(100), nullable=False)
    apellidoempleado: Mapped[str] = mapped_column(String(20), nullable=False)
    fechacontra: Mapped[date] = mapped_column(Date, nullable=False)
    telefempleado: Mapped[Optional[str]] = mapped_column(String(200))
    correoempleado: Mapped[Optional[str]] = mapped_column(String(200))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    def __repr__(self) -> str:
        return f"<Empleado id={self.idempleado} nombre={self.nombreempleado!r}>"
 
class Estudiante(Base):
    __tablename__ = "estudiante"
 
    ciestu: Mapped[str] = mapped_column(String(30), primary_key=True, unique=True)
    nombreestu: Mapped[str] = mapped_column(String(100), nullable=False)
    apelliestu: Mapped[str] = mapped_column(String(20), nullable=False)
    modulo: Mapped[int] = mapped_column(Integer, nullable=False)
    teleestu: Mapped[Optional[str]] = mapped_column(String(200))
    correoestu: Mapped[Optional[str]] = mapped_column(String(200))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Estudiante id={self.ciestu} nombre={self.nombreestu!r}>"
 
class Usuario(Base):
    __tablename__ = "usuario"
 
    iduser: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombreusuario: Mapped[str] = mapped_column(String(20), nullable=False)
    apellusuario: Mapped[str] = mapped_column(String(100), nullable=False)
    teleusuario: Mapped[Optional[str]] = mapped_column(String(200))
    correousuario: Mapped[Optional[str]] = mapped_column(String(200))
    contrase: Mapped[str] = mapped_column(String(100), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
 
    def __repr__(self) -> str:
        return f"<Usuario id={self.idusuario} nombre={self.nombreusuario!r}>"
    
class Asistencias(Base):
    __tablename__ = "asistencias"
 
    idasis: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    asisestu: Mapped[str] = mapped_column(String(20), nullable=False)
    verificar: Mapped[bool] = mapped_column(Boolean)
 
    def __repr__(self) -> str:
        return f"<Asistencia id={self.idasis}>"
    
class Bloque(Base):
    __tablename__ = "bloque"
 
    idbloque: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    dia: Mapped[str] = mapped_column(String(20), nullable=False)
    horainicio: Mapped[str] = mapped_column(String(100), nullable=False)
    horafin: Mapped[str] = mapped_column(String(100), nullable=False)

    def __repr__(self) -> str:
        return f"<Bloque id={self.idbloque}>"
 
class Asignacion_Docente(Base):
    __tablename__ = "aisgnacion_docente"
 
    id_asignacion_docente: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    empleado_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    materia_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    seccion_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    fecha_asignacion: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"<Bloque id={self.id_asignacion_docente} empleado={self.empleado_id} materia={self.materia_id}>"

class Curso(Base):
    __tablename__ = "curso"
 
    idcurso: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nomcurso: Mapped[str] = mapped_column(String(20), nullable=False)
    preciocurso: Mapped[int] = mapped_column(Integer)
    nivelcur: Mapped[str] = mapped_column(String(100), nullable=False)
    docenteasig: Mapped[int] = mapped_column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<Curso id={self.idcurso}>"
    
class CursoModulo(Base):
    __tablename__ = "curso_modulo"
 
    idcurso_modulo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    curso: Mapped[int] = mapped_column(Integer, nullable=False)
    modulo: Mapped[int] = mapped_column(Integer, nullable=False)
    horario: Mapped[int] = mapped_column(Integer, nullable=False)
    notas: Mapped[int] = mapped_column(Integer)

    def __repr__(self) -> str:
        return f"<CursoModulo id={self.idcurso_modulo}>"
    
class Horario(Base):
    __tablename__ = "horario"
 
    idhorario: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    materia: Mapped[int] = mapped_column(Integer, nullable=False)
    bloque: Mapped[int] = mapped_column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<Horario id={self.idhorario}>"
    
    
class Materias(Base):
    __tablename__ = "materia"
 
    idmateria: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombremateria: Mapped[str] = mapped_column(String(20), nullable=False)
    modulo: Mapped[int] = mapped_column(Integer, nullable=False)
    salon: Mapped[str] = mapped_column(String(100), nullable=False)
    docente: Mapped[str] = mapped_column(String(30), ForeignKey("empleado.ciempleado", ondelete="SET NULL"))

    def __repr__(self) -> str:
        return f"<Materia id={self.idmateria}>"
    
class Mensualidad_estu(Base):
    __tablename__ = "mensualidad_estu"
 
    idmensualidad_estu: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    mensualidad: Mapped[int] = mapped_column(Integer, nullable=False)
    estudiante: Mapped[str] = mapped_column(String(20), nullable=False, unique=True)
    registropago: Mapped[str] = mapped_column(String(40), nullable=False)
    fechapago: Mapped[date] = mapped_column(Date, nullable=False)
    factura: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<Mensualidad_estu id={self.idmensualidad_estu}>"
    
class MetodoPago(Base):
    __tablename__ = "metodopago"
 
    idmetodopago: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    metodousado: Mapped[str] = mapped_column(String(20), nullable=False)
    registro: Mapped[str] = mapped_column(String(20))

    def __repr__(self) -> str:
        return f"<Metodopago id={self.idmetodopago}>"
    
class Modulo(Base):
    __tablename__ = "modulo"
 
    idmodulo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombremodulo: Mapped[str] = mapped_column(String(10), nullable=False)
    materias: Mapped[str] = mapped_column(String(20), nullable=False)
    seccion: Mapped[str] = mapped_column(String(20))

    def __repr__(self) -> str:
        return f"<Modulo id={self.idmodulo}>"
    
class MonedaPago(Base):
    __tablename__ = "monedapago"
 
    idmoneda: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    tipomoneda: Mapped[str] = mapped_column(String(40), nullable=False)
    montototal: Mapped[int] = mapped_column(Integer, nullable=False)
    registro: Mapped[str] = mapped_column(String(100), nullable=False)

    def __repr__(self) -> str:
        return f"<Moneda id={self.idmoneda}>"

class Notas(Base):
    __tablename__ = "nota"
 
    idnota: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    materia: Mapped[int] = mapped_column(Integer, nullable=False)
    notas: Mapped[int] = mapped_column(Integer, nullable=False)
    fechanota: Mapped[date] = mapped_column(Date, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Notas id={self.idnota}>"
    
class PreguntasSeguridad(Base):
    __tablename__ = "preguntas_seguridad"
 
    idpregunta: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    preguntas: Mapped[str] = mapped_column(String(40), nullable=False)
    respuesta: Mapped[str] = mapped_column(String(40), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Preguntas id={self.idpregunta}>"
    
class Rol(Base):
    __tablename__ = "rol"
 
    idrol: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombrerol: Mapped[str] = mapped_column(String(40), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(300), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Rol id={self.idrol}>"
    
class Seccion(Base):
    __tablename__ = "seccion"
 
    idsecc: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nomsecc: Mapped[str] = mapped_column(String(10), nullable=False)
    horarios: Mapped[int] = mapped_column(Integer, nullable=False)
    modulo: Mapped[int] = mapped_column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<Salon id={self.idsecc}>"
    
class Mensualidad(Base):
    __tablename__ = "mensualidad"

    __table_args__ = {'extend_existing': True}

    idmensualidad: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    metodopago : Mapped[int] = mapped_column(Integer, nullable=False)
    monedapago : Mapped[int] = mapped_column(Integer, nullable=False)
    monto : Mapped[int] = mapped_column(Integer, nullable=False)
    encargado : Mapped[int] = mapped_column(Integer, nullable=False)
    verificacion :Mapped[bool] = mapped_column(Boolean)
    
# Crear Tablas
if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    print("¡Tablas creadas con éxito!")

#tokemmss
class RefreshToken(Base):
    __tablename__ = "refresh_token"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    usuario_id: Mapped[int] = mapped_column(Integer, ForeignKey("usuario.iduser"), nullable=False)
    expira: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self):
        return f"<RefreshToken usuario={self.usuario_id}>"

