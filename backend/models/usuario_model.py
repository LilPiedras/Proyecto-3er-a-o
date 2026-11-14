from typing import Optional
from sqlalchemy import (Boolean, Integer, String, ForeignKey)
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from models.base import Base

class Usuario(Base):
    __tablename__ = "usuario"

    ciuser: Mapped[str] = mapped_column(String(20), primary_key=True, unique=True)
    nombreusuario: Mapped[str] = mapped_column(String(20), nullable=False)
    apellusuario: Mapped[str] = mapped_column(String(100), nullable=False)
    estudiante: Mapped[str] = mapped_column(String(30), ForeignKey("estudiante.ciestu"), unique=True, nullable=True)
    empleado: Mapped[str] = mapped_column(String(30), ForeignKey("empleado.ciempleado"), unique=True, nullable=True)
    teleusuario: Mapped[Optional[str]] = mapped_column(String(200))
    correousuario: Mapped[Optional[str]] = mapped_column(String(200))
    contrase: Mapped[str] = mapped_column(String(100), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    logins = relationship("UserLogin", back_populates="usuario", uselist=True)

    @validates("correousuario")
    def normalizar_correo(self, _key: str, value: Optional[str]) -> Optional[str]:
        if _key == "correousuario" and value is not None:
            return value.strip().lower()
        return value

    def __repr__(self) -> str:
        return f"<Usuario id={self.ciuser} nombre={self.nombreusuario!r}>"