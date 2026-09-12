from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String,DateTime)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Mensualidad_estu(Base):
    __tablename__ = "mensualidad_estu"
 
    idmensualidad_estu: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    estudiante: Mapped[str] = mapped_column(String(20),ForeignKey("estudiante.ciestu") ,nullable=False, unique=True)
    fechapago: Mapped[Date] = mapped_column(Date, nullable=False)
    factura: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)

    def __repr__(self) -> str:
        return f"<Mensualidad_estu id={self.idmensualidad_estu}>"
    