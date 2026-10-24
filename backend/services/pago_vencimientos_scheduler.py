import asyncio
import logging

from database.connection import SessionLocal
from sqlalchemy.exc import SQLAlchemyError
from services.mensualidad_service import marcar_pagos_vencidos

logger = logging.getLogger(__name__)
INTERVALO_REVISION_SEGUNDOS = 24 * 60 * 60


def _revisar_vencimientos() -> int:
    db = SessionLocal()
    try:
        return marcar_pagos_vencidos(db)
    finally:
        db.close()


async def revisar_vencimientos_diariamente() -> None:
    while True:
        try:
            actualizados = await asyncio.to_thread(_revisar_vencimientos)
            logger.info("Verificación automática de pagos: %s marcados como vencidos", actualizados)
        except (SQLAlchemyError, RuntimeError):
            logger.exception("Falló la verificación automática de vencimientos")

        await asyncio.sleep(INTERVALO_REVISION_SEGUNDOS)
