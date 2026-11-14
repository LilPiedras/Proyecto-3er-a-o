from sqlalchemy import Integer, String, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from models.base import Base

class Asignacion_Docente(Base):
    __tablename__ = "asignacion_docente"

    id_asignacion_docente: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    empleado_id: Mapped[str] = mapped_column(String, ForeignKey("empleado.ciempleado"), nullable=False)
    materia_id: Mapped[int] = mapped_column(Integer, ForeignKey("materia.idmateria"), nullable=False)
    seccion_id: Mapped[int] = mapped_column(Integer, ForeignKey("seccion.idsecc"), nullable=False)
    horario_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("horario.idhorario"), nullable=True) # <-- Columna necesaria para el horario
    fecha_asignacion: Mapped[str] = mapped_column(String(30))

    __table_args__ = (
        UniqueConstraint(
            'empleado_id', 'materia_id', 'seccion_id', 
            name='asignacion_docente_composite_key'
        ),
    )

    def __repr__(self) -> str:
        return f"<Asignacion_Docente id={self.id_asignacion_docente} empleado={self.empleado_id} materia={self.materia_id}>"