from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String, Integer)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base 

class Seccion(Base):
    __tablename__ = "seccion"
 
    idsecc: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nomsecc: Mapped[str] = mapped_column(String(10), nullable=False)

    def __repr__(self) -> str:
        return f"<Salon id={self.idsecc}>"