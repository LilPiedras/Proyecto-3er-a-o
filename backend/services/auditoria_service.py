from database.connection import SessionLocal
from models.auditoria_model import Auditoria
from Schemas.auditoria_esquema import *
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, status, HTTPException
from typing import List
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles
import json
from datetime import date
from fastapi.encoders import jsonable_encoder

def registrar_auditoria_txt(db: Session, escritor_id: str, objeto_id: str, accion: str, dato_viejo=None, dato_nuevo=None):
    
    txt_viejo = json.dumps(jsonable_encoder(dato_viejo)) if dato_viejo else None
    txt_nuevo = json.dumps(jsonable_encoder(dato_nuevo)) if dato_nuevo else None
    auditoria = Auditoria(
        usuario_escritor_id=escritor_id,
        usuario_objeto_id=objeto_id,
        accion=accion,
        datos_anteriores=txt_viejo,
        datos_nuevos=txt_nuevo,
        fecha=date.today()
    )
    
    db.add(auditoria)

def listar_auditorias(db: Session):
    auditori = db.query(Auditoria).all()
    if not auditori:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Auditorias vacias")
    return auditori


def obtener_auditoria_por_id(idseria:int, db:Session):
    auditori = db.query(Auditoria).filter(Auditoria.idseria == idseria).first()
    if auditori is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La auditoria no fue encontrado")
    return auditori


