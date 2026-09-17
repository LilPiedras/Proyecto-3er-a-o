from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Horario(Base):
    __tablename__ = "horario"

    idhorario: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    bloque: Mapped[int] = mapped_column(Integer, ForeignKey("bloque.idbloque", ondelete="SET NULL"), nullable=False)
    dia: Mapped[str] = mapped_column(String (30), nullable=False)
    salon: Mapped[str] = mapped_column(String(30), nullable=False)

    def __repr__(self) -> str:
        return f"<Horario id={self.idhorario}>"