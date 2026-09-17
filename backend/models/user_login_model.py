from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
from models.base import Base

class UserLogin(Base):
    __tablename__ = "usuario_login"

    ciuser_log: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
    ciuser: Mapped[str] = mapped_column(String(20), ForeignKey("usuario.ciuser", ondelete="SET NULL"), nullable=False)
    idrol: Mapped[int] = mapped_column(Integer, ForeignKey("rol.idrol",ondelete="SET NULL"),nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True)

    usuario = relationship("Usuario", back_populates="login_data")