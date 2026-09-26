from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Empleado(Base):
    __tablename__ = "empleado"

    ciempleado: Mapped[str] = mapped_column(String, primary_key=True, unique=True)
    nombreempleado: Mapped[str] = mapped_column(String(100), nullable=False)
    apellidoempleado: Mapped[str] = mapped_column(String(20), nullable=False)
    fechacontra: Mapped[date] = mapped_column(Date, nullable=False)
    telefempleado: Mapped[Optional[str]] = mapped_column(String(200))
    correoempleado: Mapped[Optional[str]] = mapped_column(String(200))
    activo: Mapped[bool] = mapped_column(Boolean, default=True)
    #def __repr__(self) -> str:
    #  return f"<Empleado id={self.idempleado} nombre={self.nombreempleado!r}>"