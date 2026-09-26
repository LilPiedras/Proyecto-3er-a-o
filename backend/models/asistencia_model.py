from datetime import date
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Asistencias(Base):
    __tablename__ = "asistencias"

    idasis: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    asisestu: Mapped[str] = mapped_column(String(30), ForeignKey("estudiante.ciestu", ondelete="CASCADE"), nullable=False)
    idmateria: Mapped[int] = mapped_column(Integer, ForeignKey("materia.idmateria", ondelete="CASCADE"), nullable=False)
    fecha: Mapped[date] = mapped_column(Date, nullable=False)
    verificar: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    def __repr__(self) -> str:
        return f"<Asistencia id={self.idasis} estudiante='{self.asisestu}' materia={self.idmateria}>"