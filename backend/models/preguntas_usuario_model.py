<<<<<<< HEAD
from sqlalchemy import (Boolean, Date, ForeignKey, Integer, String)
from sqlalchemy.orm import Mapped, mapped_column
=======
from datetime import date
from typing import Optional
from sqlalchemy import (Boolean, Date, ForeignKey,Integer, String)
from sqlalchemy.orm import (DeclarativeBase, Mapped, mapped_column, relationship,)
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac
from models.base import Base    
    
class Preguntas_Usuario(Base):
    __tablename__ = "preguntas_usuario"
 
    idpreuser: Mapped[int] = mapped_column(Integer, primary_key=True, unique=True)
<<<<<<< HEAD
    ciuser: Mapped[str] = mapped_column(String(20), ForeignKey("usuario.ciuser"), nullable=False)
    idpregunta: Mapped[int] = mapped_column(Integer, ForeignKey("preguntas_seguridad.idpregunta"), nullable=False)
    respuesta: Mapped[str] = mapped_column(String(255), nullable=False) # Ampliado para soportar el hash
=======
    ciuser: Mapped[str] = mapped_column(String(20),ForeignKey("usuario.ciuser") ,nullable=False)
    idpregunta: Mapped[int] = mapped_column(Integer,ForeignKey("preguntas_seguridad.idpregunta") ,nullable=False)
    respuesta: Mapped[str] = mapped_column(String(20), nullable=False)
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac

    def __repr__(self) -> str:
        return f"<Preguntas_User id={self.idpreuser}>"