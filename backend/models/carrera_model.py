from decimal import Decimal
from sqlalchemy import (Boolean, Integer, Numeric, String)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Carrera(Base):
    __tablename__ = "carrera"

    idcarrera: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombrecarrera: Mapped[str] = mapped_column(String(90), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(100), nullable=False)
    precio_usd: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Carrera id={self.idcarrera}>"