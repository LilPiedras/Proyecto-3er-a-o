from sqlalchemy import (Integer, String, Boolean)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Bloque(Base):
    __tablename__ = "bloque"

    idbloque: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    horainicio: Mapped[str] = mapped_column(String(100), nullable=False)
    horafin: Mapped[str] = mapped_column(String(100), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Bloque id={self.idbloque}>"