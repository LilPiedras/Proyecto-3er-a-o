from datetime import date
from decimal import Decimal
from typing import Optional
from sqlalchemy import Boolean, Date, ForeignKey, Integer, String, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

class PlanEvaluacion(Base):
    __tablename__ = "plan_evaluacion"

    idevaluacion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idmateria: Mapped[int] = mapped_column(Integer, ForeignKey("materia.idmateria", ondelete="CASCADE"), nullable=False)
    idsecc: Mapped[int] = mapped_column(Integer, ForeignKey("seccion.idsecc", ondelete="CASCADE"), nullable=False)
    titulo: Mapped[str] = mapped_column(String(100), nullable=False)
    porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    notas: Mapped[list["Notas"]] = relationship("Notas", back_populates="plan_evaluacion")

    def __repr__(self) -> str:
        return f"<PlanEvaluacion id={self.idevaluacion} titulo='{self.titulo}'>"


class Notas(Base):
    __tablename__ = "nota"

    idnota: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    oferta: Mapped[int] = mapped_column(Integer, ForeignKey("oferta_seccion.idseccmo", ondelete="CASCADE"), nullable=False)
    idevaluacion: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("plan_evaluacion.idevaluacion", ondelete="SET NULL"), nullable=True)
    notas: Mapped[Decimal] = mapped_column(Numeric(4, 2), nullable=False) # Permite guardar con precisión decimal antes del redondeo
    fechanota: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    plan_evaluacion: Mapped[Optional[PlanEvaluacion]] = relationship("PlanEvaluacion", back_populates="notas")

    def __repr__(self) -> str:
        return f"<Notas id={self.idnota} nota={self.notas}>"