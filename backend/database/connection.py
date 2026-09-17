from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base

# Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
<<<<<<< HEAD
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/prueba2"
=======
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:3690@localhost:5432/aver"
>>>>>>> 2306ea622727522274ae7a431c6d3ef18695715c

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()