from sqlalchemy import (Boolean, ForeignKey,Integer)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Carrera_Modulo(Base):
    __tablename__ = "carrera_modulo"

    idcarremo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    idmatemo: Mapped[int] = mapped_column(Integer,ForeignKey("materias_modulo.idmatemo") ,nullable=False)
    idcarrera: Mapped[int] = mapped_column(Integer,ForeignKey("carrera.idcarrera") ,nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Carrera_Modulo id={self.idcarremo}>"