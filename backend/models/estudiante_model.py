from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Integer, String)
from sqlalchemy.orm import Mapped, mapped_column, validates
from models.base import Base

class Estudiante(Base):
    __tablename__ = "estudiante"
 
    ciestu: Mapped[str] = mapped_column(String(30), primary_key=True, unique=True)
    nombreestu: Mapped[str] = mapped_column(String(100), nullable=False)
    apelliestu: Mapped[str] = mapped_column(String(20), nullable=False)
    teleestu: Mapped[Optional[str]] = mapped_column(String(200))
    correoestu: Mapped[Optional[str]] = mapped_column(String(200))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    @validates("correoestu")
    def normalizar_correo(self, _key: str, value: Optional[str]) -> Optional[str]:
        if _key == "correoestu" and value is not None:
            return value.strip().lower()
        return value

    def __repr__(self) -> str:
        return f"<Estudiante id={self.ciestu} nombre={self.nombreestu!r}>"