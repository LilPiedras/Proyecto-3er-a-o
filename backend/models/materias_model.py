from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base


class Materias(Base):
    __tablename__ = "materia"
 
    idmateria: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombremateria: Mapped[str] = mapped_column(String(20), nullable=False)
    docente: Mapped[str] = mapped_column(String(30), ForeignKey("empleado.ciempleado", ondelete="SET NULL"))
    activo : Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Materia id={self.idmateria}>"