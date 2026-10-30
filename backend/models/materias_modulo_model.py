from sqlalchemy import ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from models.base import Base

class Materias_Modulo(Base):
    __tablename__ = "materias_modulo"

    idmatemo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    idmateria: Mapped[int] = mapped_column(
        Integer, ForeignKey("materia.idmateria", ondelete="CASCADE"), nullable=False
    )
    idmodulo: Mapped[int] = mapped_column(
        Integer, ForeignKey("modulo.idmodulo", ondelete="CASCADE"), nullable=False
    )

    materia: Mapped["Materias"] = relationship(back_populates="modulos_asociados")
    modulo: Mapped["Modulo"] = relationship(back_populates="materias_asociadas")

    def __repr__(self) -> str:
        return f"<Materias_Modulo id={self.idmatemo} idmateria={self.idmateria} idmodulo={self.idmodulo}>"