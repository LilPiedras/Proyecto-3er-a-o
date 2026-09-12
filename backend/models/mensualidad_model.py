from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base    
    
class Mensualidad(Base):
    __tablename__ = "mensualidad"
 
    idmensualidad: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    metodopago: Mapped[str] = mapped_column(String(20), nullable=False)
    monedapago: Mapped[str] = mapped_column(String(20), nullable=False)
    monto: Mapped[int] = mapped_column(Integer, nullable=False)
    verificacion: Mapped[bool] = mapped_column(Boolean, nullable=False)
    encargado: Mapped[int] = mapped_column(Integer, nullable=False)

    def __repr__(self) -> str:
        return f"<mensualidad id={self.idmensualidad}>"
    