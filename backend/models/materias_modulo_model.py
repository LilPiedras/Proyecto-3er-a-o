from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String, DateTime)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Materias_Modulo(Base):
    __tablename__ = "materias_modulo"
 
    idmatemo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    idmateria: Mapped[int] = mapped_column(Integer,ForeignKey("materia.idmateria"),nullable=False)
    idmodulo: Mapped[int] = mapped_column(Integer,ForeignKey("modulo.idmodulo") ,nullable=False)

    def __repr__(self) -> str:
        return f"<Materias_Modulo id={self.idmatemo}>"