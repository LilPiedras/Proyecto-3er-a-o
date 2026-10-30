from datetime import date
from typing import Optional
from sqlalchemy import Integer, String, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Periodo(Base):
    __tablename__ = "periodo_academico"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    fecha_inicio: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin: Mapped[Optional[date]] = mapped_column(Date, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    def __repr__(self) -> str:
        return f"<Periodo id={self.id} nombre='{self.nombre}'>"