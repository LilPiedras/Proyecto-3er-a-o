from typing import Optional, List
from sqlalchemy import Boolean, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

class Materias(Base):
    __tablename__ = "materia"

    idmateria: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombremateria: Mapped[str] = mapped_column(String(20), nullable=False)
    docente: Mapped[Optional[str]] = mapped_column(
        String(30), ForeignKey("empleado.ciempleado", ondelete="SET NULL"), nullable=True
    )
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    modulos_asociados: Mapped[List["Materias_Modulo"]] = relationship(
        back_populates="materia", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Materia id={self.idmateria} nombre={self.nombremateria}>"