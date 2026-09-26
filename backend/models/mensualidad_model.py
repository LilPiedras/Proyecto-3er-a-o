from datetime import date, datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Date, DateTime, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

if TYPE_CHECKING:
    from models.mensualidad_estu_model import Mensualidad_estu

class Mensualidad(Base):
    __tablename__ = "mensualidad"

    idmensualidad: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    
    # Cambiados a Integer con ForeignKey
    metodopago: Mapped[int] = mapped_column(Integer, ForeignKey("metodopago.idmetodopago"), nullable=False)
    monedapago: Mapped[int] = mapped_column(Integer, ForeignKey("monedapago.idmoneda"), nullable=False)
    
    monto: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    verificacion: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    encargado: Mapped[Optional[str]] = mapped_column(String(30), ForeignKey("usuario.ciuser", ondelete="SET NULL"), nullable=True)
    periodo: Mapped[str] = mapped_column(String(20), nullable=False)
    fecha_corte: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_creacion: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    estado: Mapped[str] = mapped_column(String(20), default="pendiente", nullable=False)

    estudiantes_asignados: Mapped[list["Mensualidad_estu"]] = relationship("Mensualidad_estu", back_populates="mensualidad")

    def __repr__(self) -> str:
        return f"<Mensualidad id={self.idmensualidad} periodo='{self.periodo}'>"