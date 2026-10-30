from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

class Oferta_seccion(Base):
    __tablename__ = "oferta_seccion"

    idseccmo: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    idcarrera: Mapped[int] = mapped_column(Integer, ForeignKey("carrera.idcarrera"), nullable=False)
    idsecc: Mapped[int] = mapped_column(Integer, ForeignKey("seccion.idsecc"), nullable=False)
    estudiante: Mapped[str | None] = mapped_column(String(25), ForeignKey("estudiante.ciestu"), nullable=True)
    horario: Mapped[int | None] = mapped_column(Integer, ForeignKey("horario.idhorario"), nullable=True)
    idcarremo: Mapped[int | None] = mapped_column(Integer, ForeignKey("carrera_modulo.idcarremo"), nullable=True)

    seccion_rel = relationship("Seccion")
    horario_rel = relationship("Horario")

    def __repr__(self) -> str:
        return f"<Oferta_seccion id={self.idseccmo}>"