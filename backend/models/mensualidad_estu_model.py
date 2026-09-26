from datetime import date
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

# Esto le enseña a Pylance qué es "Mensualidad" solo durante el análisis de código:
if TYPE_CHECKING:
    from models.mensualidad_model import Mensualidad

class Mensualidad_estu(Base):
    __tablename__ = "mensualidad_estu"

    idmensualidad_estu: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    estudiante: Mapped[str] = mapped_column(String(30), ForeignKey("estudiante.ciestu", ondelete="CASCADE"), nullable=False)
    idmensualidad: Mapped[int] = mapped_column(Integer, ForeignKey("mensualidad.idmensualidad", ondelete="CASCADE"), nullable=False)
    fechapago: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    factura: Mapped[Optional[str]] = mapped_column(String(100), unique=True, nullable=True)
    monto_pagado: Mapped[Optional[Decimal]] = mapped_column(Numeric(12, 2), nullable=True)
    fecha_vencimiento: Mapped[date] = mapped_column(Date, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente", nullable=False)
    periodo: Mapped[str] = mapped_column(String(20), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    mensualidad: Mapped["Mensualidad"] = relationship("Mensualidad", back_populates="estudiantes_asignados")

    def __repr__(self) -> str:
        return f"<Mensualidad_estu id={self.idmensualidad_estu} estudiante='{self.estudiante}' estado='{self.estado}'>"