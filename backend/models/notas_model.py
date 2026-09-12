from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String, DateTime)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Notas(Base):
    __tablename__ = "nota"
 
    idnota: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    oferta: Mapped[int] = mapped_column(Integer)
    notas: Mapped[int] = mapped_column(Integer, nullable=False)
    fechanota: Mapped[Date] = mapped_column(Date, nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Notas id={self.idnota}>"