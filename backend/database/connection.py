from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base

# Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:3690@localhost:5432/aver"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()