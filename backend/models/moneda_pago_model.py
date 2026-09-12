from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String, Integer)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base 

class MonedaPago(Base):
    __tablename__ = "monedapago"
 
    idmoneda: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    tipomoneda: Mapped[str] = mapped_column(String(40), nullable=False)
    montototal: Mapped[int] = mapped_column(Integer, nullable=False)
    registro: Mapped[str] = mapped_column(String(100), nullable=False)

    def __repr__(self) -> str:
        return f"<Moneda id={self.idmoneda}>"
