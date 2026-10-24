from typing import TYPE_CHECKING
from sqlalchemy import Boolean, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

if TYPE_CHECKING:
    from models.inscripcion_model import Inscripcion
    from models.seccion_model import Seccion


class Detalle_Inscripcion(Base):
    __tablename__ = "detalle_inscripcion_seccion"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    inscripcion_periodo_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("inscripcion_periodo.id"), nullable=False
    )
    seccion_id: Mapped[int] = mapped_column(Integer, ForeignKey("seccion.idsecc"), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    inscripcion: Mapped["Inscripcion"] = relationship("Inscripcion", back_populates="detalles")
    seccion_rel: Mapped["Seccion"] = relationship("Seccion")

    __table_args__ = (
        Index(
            "uq_detalle_inscripcion_activo_seccion",
            "inscripcion_periodo_id",
            "seccion_id",
            unique=True,
            postgresql_where=activo.is_(True),
            sqlite_where=activo.is_(True),
        ),
    )

    def __repr__(self) -> str:
        return f"<Detalle_Inscripcion id={self.id} seccion_id={self.seccion_id}>"