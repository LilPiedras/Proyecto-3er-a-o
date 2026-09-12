from datetime import datetime
from pathlib import Path
import json

from sqlalchemy import create_engine, text

DB_URL = "postgresql://postgres:3690@localhost:5432/prueba2"
OUTPUT_FILE = Path(__file__).with_name("kpi_dashboard.json")

engine = create_engine(DB_URL)

def get_kpi_payload():
    with engine.connect() as conn:
        resumen = conn.execute(text("""
            SELECT
                COUNT(*) AS total_registros,
                ROUND(AVG(m.monto), 2) AS promedio_monto,
                COUNT(CASE WHEN me.estado = 'pagado' THEN 1 END) AS pagos_realizados,
                COUNT(CASE WHEN me.estado IN ('pendiente', 'vencido') THEN 1 END) AS pagos_pendientes,
                ROUND(
                    100.0 * COUNT(CASE WHEN me.estado = 'pagado' THEN 1 END) / NULLIF(COUNT(*), 0),
                    2
                ) AS porcentaje_cumplimiento,
                COUNT(DISTINCT me.estudiante) AS total_estudiantes,
                ROUND(COUNT(DISTINCT me.estudiante) / NULLIF(COUNT(*), 0), 2) AS media_estudiantes
            FROM mensualidad_estu me
            LEFT JOIN mensualidad m
                ON m.idmensualidad = me.idmensualidad
        """)).mappings().first()

        series = conn.execute(text("""
            SELECT
                me.periodo,
                SUM(m.monto) AS total_recaudado,
                COUNT(*) AS total_pagos
            FROM mensualidad_estu me
            LEFT JOIN mensualidad m
                ON m.idmensualidad = me.idmensualidad
            GROUP BY me.periodo
            ORDER BY me.periodo
        """)).mappings().all()

        alertas = conn.execute(text("""
            SELECT
                estado,
                COUNT(*) AS cantidad
            FROM mensualidad_estu
            GROUP BY estado
            ORDER BY estado
        """)).mappings().all()

    payload = {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_registros": int(resumen["total_registros"]) if resumen["total_registros"] is not None else 0,
            "promedio_monto": float(resumen["promedio_monto"]) if resumen["promedio_monto"] is not None else 0.0,
            "pagos_realizados": int(resumen["pagos_realizados"]) if resumen["pagos_realizados"] is not None else 0,
            "pagos_pendientes": int(resumen["pagos_pendientes"]) if resumen["pagos_pendientes"] is not None else 0,
            "porcentaje_cumplimiento": float(resumen["porcentaje_cumplimiento"]) if resumen["porcentaje_cumplimiento"] is not None else 0.0,
            "total_estudiantes": int(resumen["total_estudiantes"]) if resumen["total_estudiantes"] is not None else 0,
            "media_estudiantes": float(resumen["media_estudiantes"]) if resumen["media_estudiantes"] is not None else 0.0,
        },
        "alerts": [
            {"estado": row["estado"], "cantidad": int(row["cantidad"])}
            for row in alertas
        ],
        "series": [
            {
                "periodo": row["periodo"],
                "total_recaudado": float(row["total_recaudado"]) if row["total_recaudado"] is not None else 0.0,
                "total_pagos": int(row["total_pagos"]) if row["total_pagos"] is not None else 0
            }
            for row in series
        ],
    }

    return payload

def main():
    payload = get_kpi_payload()
    OUTPUT_FILE.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"JSON generado en: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()