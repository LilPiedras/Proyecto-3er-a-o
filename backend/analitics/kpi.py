from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from datetime import datetime

router = APIRouter(prefix="/analitics", tags=["Analitics"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/dashboard")
def obtener_dashboard(db: Session = Depends(get_db)):
    resumen = db.execute(text("""
        SELECT
            COUNT(*) AS total_registros,
            ROUND(AVG(m.monto), 2) AS promedio_monto,
            COUNT(CASE WHEN me.estado = 'pagado' THEN 1 END) AS pagos_realizados,
            COUNT(CASE WHEN me.estado IN ('pendiente', 'vencido') THEN 1 END) AS pagos_pendientes,
            ROUND(
                100.0 * COUNT(CASE WHEN me.estado = 'pagado' THEN 1 END) / NULLIF(COUNT(*), 0),
                2
            ) AS porcentaje_cumplimiento
        FROM mensualidad_estu me
        LEFT JOIN mensualidad m
            ON m.idmensualidad = me.idmensualidad
    """)).mappings().first()

    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_registros": int(resumen["total_registros"]) if resumen["total_registros"] is not None else 0,
            "promedio_monto": float(resumen["promedio_monto"]) if resumen["promedio_monto"] is not None else 0.0,
            "pagos_realizados": int(resumen["pagos_realizados"]) if resumen["pagos_realizados"] is not None else 0,
            "pagos_pendientes": int(resumen["pagos_pendientes"]) if resumen["pagos_pendientes"] is not None else 0,
            "porcentaje_cumplimiento": float(resumen["porcentaje_cumplimiento"]) if resumen["porcentaje_cumplimiento"] is not None else 0.0,
            #-indice de smicks abusados por la novia = 0%-#

        }
    }