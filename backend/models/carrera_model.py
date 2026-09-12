from sqlalchemy import (Boolean, Integer, String)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Carrera(Base):
    __tablename__ = "carrera"

    idcarrera: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombrecarrera: Mapped[str] = mapped_column(String(20), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(100), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Carrera id={self.idcarrera}>"