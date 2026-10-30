from datetime import date
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Boolean, Date, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

if TYPE_CHECKING:
    from models.detalle_inscripcion_model import Detalle_Inscripcion


class Inscripcion(Base):
    __tablename__ = "inscripcion_periodo"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    fecha_inscripcion: Mapped[date] = mapped_column(Date, nullable=False)
    periodo_id: Mapped[int] = mapped_column(Integer, ForeignKey("periodo_academico.id"), nullable=False)
    ciestu: Mapped[Optional[str]] = mapped_column(String(30), ForeignKey("estudiante.ciestu", ondelete="SET NULL"), nullable=True)
    estado: Mapped[str] = mapped_column(String(40), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    detalles: Mapped[list["Detalle_Inscripcion"]] = relationship(
        "Detalle_Inscripcion",
        back_populates="inscripcion",
        lazy="selectin",
    )

    __table_args__ = (
        Index(
            "uq_inscripcion_activa_estudiante_periodo",
            "ciestu",
            "periodo_id",
            unique=True,
            postgresql_where=activo.is_(True),
            sqlite_where=activo.is_(True),
        ),
    )

    def __repr__(self) -> str:
        return f"<Inscripcion id={self.id}>"