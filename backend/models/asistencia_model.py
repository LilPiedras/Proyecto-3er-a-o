from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Asistencias(Base):
    __tablename__ = "asistencias"

    idasis: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    asisestu: Mapped[str] = mapped_column(String(30),ForeignKey("estudiante.ciestu") ,nullable=False)
    fecha: Mapped[Date] = mapped_column(Date,nullable=False)
    verificar: Mapped[bool] = mapped_column(Boolean)

    def __repr__(self) -> str:
        return f"<Asistencia id={self.idasis}>"