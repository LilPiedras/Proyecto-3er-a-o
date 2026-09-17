from datetime import date
from typing import Optional
from sqlalchemy import (Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Auditoria(Base):
    __tablename__ = "auditoria"

    idseria: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    usuario_escritor_id: Mapped[str] = mapped_column(String(20),ForeignKey("usuario.ciuser") ,nullable=False)
    usuario_objeto_id: Mapped[str] = mapped_column(String(20), ForeignKey("usuario.ciuser"), nullable=False)
    accion: Mapped[str] = mapped_column(String(100), nullable=False)
    datos_anteriores: Mapped[Optional[str]] = mapped_column(String(200))
    datos_nuevos: Mapped[Optional[str]] = mapped_column(String(200))
    fecha: Mapped[date] = mapped_column(Date, nullable=False)

    def __repr__(self) -> str:
        return f"<Auditoria id={self.idseria}>"