import json
from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import extract
from sqlalchemy.orm import Session

from models.auditoria_model import Auditoria


def registrar_auditoria_txt(db: Session, escritor_id: str, objeto_id: str, accion: str, dato_viejo=None, dato_nuevo=None):
    momento = datetime.now()
    txt_viejo = json.dumps(jsonable_encoder(dato_viejo)) if dato_viejo else None
    txt_nuevo = json.dumps(jsonable_encoder(dato_nuevo)) if dato_nuevo else None
    auditoria = Auditoria(
        usuario_escritor_id=escritor_id,
        usuario_objeto_id=objeto_id,
        accion=accion,
        datos_anteriores=txt_viejo,
        datos_nuevos=txt_nuevo,
        fecha=momento.date(),
        hora=momento.time(),
    )
    db.add(auditoria)


def listar_auditorias(
    db: Session,
    mes: Optional[int] = None,
    dia: Optional[int] = None,
    hora: Optional[int] = None,
):
    consulta = db.query(Auditoria)
    if mes is not None:
        consulta = consulta.filter(extract("month", Auditoria.fecha) == mes)
    if dia is not None:
        consulta = consulta.filter(extract("day", Auditoria.fecha) == dia)
    if hora is not None:
        consulta = consulta.filter(extract("hour", Auditoria.hora) == hora)
    return consulta.order_by(
        Auditoria.fecha.desc(),
        Auditoria.hora.desc().nullslast(),
        Auditoria.idseria.desc(),
    ).all()


def obtener_auditoria_por_id(idseria: int, db: Session):
    auditori = db.query(Auditoria).filter(Auditoria.idseria == idseria).first()
    if auditori is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La auditoria no fue encontrada")
    return auditori
