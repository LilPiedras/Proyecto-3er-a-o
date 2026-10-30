from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String, Integer)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class MetodoPago(Base):
    __tablename__ = "metodopago"
 
    idmetodopago: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    metodousado: Mapped[str] = mapped_column(String(20), nullable=False)
    registro: Mapped[str] = mapped_column(String(20))

    def __repr__(self) -> str:
        return f"<Metodopago id={self.idmetodopago}>"
    