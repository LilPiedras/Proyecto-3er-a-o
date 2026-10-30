from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.base import Base

# Formato: postgresql://usuario:contraseña@host:puerto/nombre_bd
<<<<<<< HEAD
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:1234@localhost:5432/academica"
=======
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:3690@localhost:5432/academic1"
>>>>>>> 49b812ced42dcb2b4e451415474e74cf6a65e3ac

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()