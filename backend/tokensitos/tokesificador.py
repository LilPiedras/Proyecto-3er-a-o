from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
import bcrypt 

SECRET_KEY = "AMANDAFASHION"
REFRESH_SECRET_KEY = "AMANDAFASHION"
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = 480    
REFRESH_TOKEN_EXPIRE_DAYS = 7         

def hashear_password(password: str) -> str:
 
    password_bytes = password.encode('utf-8')
    sal = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(password_bytes, sal)
    return hash_bytes.decode('utf-8')

def verificar_password(password_plano: str, password_hash: str) -> bool:
    try:
        password_bytes = password_plano.encode('utf-8')
        hash_bytes = password_hash.strip().encode('utf-8')
        return bcrypt.checkpw(password_bytes, hash_bytes)
    except Exception:
        return False

def crear_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def crear_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)

def decodificar_access_token(token: str) -> dict:
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

def decodificar_refresh_token(token: str) -> dict:
    return jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])