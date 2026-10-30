from decimal import Decimal
from typing import Optional
from sqlalchemy import ForeignKey, Integer, String, Boolean, Numeric
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Curso(Base):
    __tablename__ = "curso"

    idcurso: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nomcurso: Mapped[str] = mapped_column(String(100), nullable=False)
    preciocurso: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    nivelcur: Mapped[str] = mapped_column(String(100), nullable=False)
    docenasig: Mapped[Optional[str]] = mapped_column(String(30), ForeignKey("empleado.ciempleado", ondelete="SET NULL"), nullable=True)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Curso id={self.idcurso} nombre='{self.nomcurso}'>"