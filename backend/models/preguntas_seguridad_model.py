from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, String, Integer)
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class PreguntasSeguridad(Base):
    __tablename__ = "preguntas_seguridad"
 
    idpregunta: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    preguntas: Mapped[str] = mapped_column(String(40), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Preguntas id={self.idpregunta}>"
    