from sqlalchemy import (ForeignKey,Integer, String, Boolean)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Curso(Base):
    __tablename__ = "curso"

    idcurso: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nomcurso: Mapped[str] = mapped_column(String(20), nullable=False)
    preciocurso: Mapped[int] = mapped_column(Integer)
    nivelcur: Mapped[str] = mapped_column(String(100), nullable=False)
    docenasig: Mapped[str] = mapped_column(String(30),ForeignKey("empleado.ciempleado") ,nullable=True)
    activo : Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Curso id={self.idcurso}>"