from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class Modulo(Base):
    __tablename__ = "modulo"
 
    idmodulo: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    nombremodulo: Mapped[str] = mapped_column(String(10), nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    def __repr__(self) -> str:
        return f"<Modulo id={self.idmodulo}>"