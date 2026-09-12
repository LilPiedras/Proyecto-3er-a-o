from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Integer, String)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Estudiante(Base):
    __tablename__ = "estudiante"
 
    ciestu: Mapped[str] = mapped_column(String(30), primary_key=True, unique=True)
    nombreestu: Mapped[str] = mapped_column(String(100), nullable=False)
    apelliestu: Mapped[str] = mapped_column(String(20), nullable=False)
    teleestu: Mapped[Optional[str]] = mapped_column(String(200))
    correoestu: Mapped[Optional[str]] = mapped_column(String(200))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Estudiante id={self.ciestu} nombre={self.nombreestu!r}>"