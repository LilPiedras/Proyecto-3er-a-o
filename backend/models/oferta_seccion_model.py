from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

class Oferta_seccion(Base):
    __tablename__ = "oferta_seccion"

    idseccmo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    idcarremo: Mapped[int] = mapped_column(Integer, ForeignKey("carrera_modulo.idcarremo"), nullable=False)
    idsecc: Mapped[int] = mapped_column(Integer, ForeignKey("seccion.idsecc"), nullable=False)
    estudiante: Mapped[str] = mapped_column(String(25), ForeignKey("estudiante.ciestu"), nullable=True)
    horario: Mapped[int] = mapped_column(Integer, ForeignKey("horario.idhorario"), nullable=True)

    # Relaciones lógicas para conectar con el resto del sistema de forma limpia
    carrera_rel = relationship(
        "Carrera",
        secondary="carrera_modulo",
        primaryjoin="Oferta_seccion.idcarremo == Carrera_Modulo.idcarremo",
        secondaryjoin="Carrera_Modulo.idcarrera == Carrera.idcarrera",
        viewonly=True,
    )
    seccion_rel = relationship("Seccion")
    horario_rel = relationship("Horario")

    def __repr__(self) -> str:
        return f"<Oferta_seccion id={self.idseccmo}>"