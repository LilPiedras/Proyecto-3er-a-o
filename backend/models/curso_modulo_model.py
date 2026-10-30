from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class CursoModulo(Base):
    __tablename__ = "curso_modulo"
 
    idcurso_modulo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    curso: Mapped[int] = mapped_column(Integer,ForeignKey("curso.idcurso") ,nullable=False)
    modulo: Mapped[int] = mapped_column(Integer,ForeignKey("modulo.idmodulo") ,nullable=True)
    horario: Mapped[int] = mapped_column(Integer,ForeignKey("horario.idhorario") ,nullable=True)
    notas: Mapped[int] = mapped_column(Integer,ForeignKey("nota.idnota"), nullable=False)

    def __repr__(self) -> str:
        return f"<CursoModulo id={self.idcurso_modulo}>"
    