from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String, DateTime)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Oferta_seccion(Base):
    __tablename__ = "oferta_seccion"
 
    idseccmo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    idcarremo: Mapped[int] = mapped_column(Integer,ForeignKey("carrera.idcarrera") ,nullable=False)
    idsecc: Mapped[int] = mapped_column(Integer,ForeignKey("seccion.idsecc") ,nullable=False)
    estudiante: Mapped[str] = mapped_column(String (25),ForeignKey("estudiante.ciestu") ,nullable=True)
    horario: Mapped[int] = mapped_column(Integer,ForeignKey("horario.idhorario") ,nullable=True)

    def __repr__(self) -> str:
        return f"<Notas id={self.idnota}>"