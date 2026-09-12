from sqlalchemy import (Integer, String)
from sqlalchemy.orm import (Mapped, mapped_column)
from models.base import Base

class Asignacion_Docente(Base):
    __tablename__ = "asignacion_docente"

    id_asignacion_docente: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    empleado_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    materia_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    seccion_id: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    fecha_asignacion: Mapped[str] = mapped_column(String(30))

    def __repr__(self) -> str:
        return f"<Bloque id={self.id_asignacion_docente} empleado={self.empleado_id} materia={self.materia_id}>"