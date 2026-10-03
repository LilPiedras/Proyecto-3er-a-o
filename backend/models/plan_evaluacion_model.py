from decimal import Decimal
from typing import List, TYPE_CHECKING
from sqlalchemy import Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

# Importar la misma Base que usas en los demás modelos
from models.base import Base

if TYPE_CHECKING:
    from models.notas_model import Notas


class PlanEvaluacion(Base):
    __tablename__ = "plan_evaluacion"

    idevaluacion: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idmateria: Mapped[int] = mapped_column(Integer, nullable=False)
    idsecc: Mapped[int] = mapped_column(Integer, nullable=False)
    titulo: Mapped[str] = mapped_column(String(100), nullable=False)
    porcentaje: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)

    # RELACIÓN AGREGADA (Resuelve el error de 'has no property notas')
    notas: Mapped[List["Notas"]] = relationship("Notas", back_populates="plan_evaluacion")

    def __repr__(self) -> str:
        return f"<PlanEvaluacion id={self.idevaluacion} titulo={self.titulo}>"