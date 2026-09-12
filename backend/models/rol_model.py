from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String, Integer)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Rol(Base):
    __tablename__ = "rol"
 
    idrol: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombrerol: Mapped[str] = mapped_column(String(40), nullable=False)
    descripcion: Mapped[str] = mapped_column(String(300), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Rol id={self.idrol}>"
    