from datetime import datetime

from fastapi import APIRouter, Depends, Response
from sqlalchemy import text
from sqlalchemy.orm import Session

from analitics.pdf import crear_pdf_mensualidades, crear_pdf_horario_docente
from database.connection import SessionLocal
from models.usuario_model import Usuario
from tokensitos.auth_depencias import VerificarRoles

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
        JOIN mensualidad m
            ON m.idmensualidad = me.idmensualidad
        WHERE me.activo IS TRUE AND m.activo IS TRUE
    """)).mappings().first()

    return {
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "summary": {
            "total_registros": int(resumen["total_registros"]) if resumen["total_registros"] is not None else 0,
            "promedio_monto": float(resumen["promedio_monto"]) if resumen["promedio_monto"] is not None else 0.0,
            "pagos_realizados": int(resumen["pagos_realizados"]) if resumen["pagos_realizados"] is not None else 0,
            "pagos_pendientes": int(resumen["pagos_pendientes"]) if resumen["pagos_pendientes"] is not None else 0,
            "porcentaje_cumplimiento": float(resumen["porcentaje_cumplimiento"]) if resumen["porcentaje_cumplimiento"] is not None else 0.0,
        },
    }


@router.get("/mensualidades/pdf", response_class=Response)
def descargar_reporte_mensualidades(
    db: Session = Depends(get_db),
    _current_user: Usuario = Depends(VerificarRoles([1])),
):
    registros = db.execute(text("""
        SELECT
            periodo_academico.nombre AS periodo,
            CONCAT(estudiante.nombreestu, ' ', estudiante.apelliestu) AS estudiante,
            me.estudiante AS ci,
            m.monto_carreras_usd AS monto_base_usd,
            m.tasa_conversion,
            m.monto_extra,
            COALESCE(me.monto_pagado, m.monto) AS monto,
            monedapago.tipomoneda AS moneda,
            me.estado,
            me.fecha_vencimiento,
            me.fechapago
        FROM mensualidad_estu me
        JOIN mensualidad m
            ON m.idmensualidad = me.idmensualidad
        JOIN estudiante
            ON estudiante.ciestu = me.estudiante
        LEFT JOIN periodo_academico
            ON periodo_academico.id = me.periodo_id
        LEFT JOIN monedapago
            ON monedapago.idmoneda = m.monedapago
        WHERE me.activo IS TRUE AND m.activo IS TRUE
        ORDER BY periodo_academico.fecha_inicio NULLS LAST,
            periodo_academico.nombre, estudiante.nombreestu, me.idmensualidad_estu
    """)).mappings().all()

    pdf_content = crear_pdf_mensualidades([dict(registro) for registro in registros])
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": 'attachment; filename="reporte_mensualidades.pdf"'},
    )

@router.get("/horario-docente/pdf", response_class=Response)
def descargar_horario_docente(db: Session = Depends(get_db), current_user: Usuario = Depends(VerificarRoles([1, 2, 4]))):
    ci = str(getattr(current_user, "ciuser", None) or getattr(current_user, "empleado", None) or "").strip()

    if not ci:
        return Response(
            content=b"No se encontro cedula del docente",
            status_code=400,
        )

    rows = db.execute(
        text("""
            SELECT
                m.idmateria,
                COALESCE(m.nombremateria, 'Sin materia') AS materia,
                COALESCE(mod.nombremodulo, 'Sin modulo') AS modulo,
                COALESCE(h.dia, 'Por definir') AS dia,
                COALESCE(h.salon, 'S/N') AS salon,
                COALESCE(b.horainicio::text, '') AS horainicio,
                COALESCE(b.horafin::text, '') AS horafin,
                os.idsecc,
                COALESCE(s.nomsecc, 'Sin seccion') AS seccion,
                e.ciempleado
            FROM public.oferta_seccion os
            LEFT JOIN public.horario h ON os.horario = h.idhorario
            LEFT JOIN public.bloque b ON h.bloque = b.idbloque
            LEFT JOIN public.seccion s ON s.idsecc = os.idsecc
            LEFT JOIN public.carrera_modulo cm ON cm.idcarremo = os.idcarremo
            LEFT JOIN public.materias_modulo mm ON mm.idmatemo = cm.idmatemo
            LEFT JOIN public.materia m ON m.idmateria = mm.idmateria
            LEFT JOIN public.modulo mod ON mod.idmodulo = mm.idmodulo
            LEFT JOIN public.empleado e ON m.docente = e.ciempleado
            WHERE os.horario IS NOT NULL
              AND e.ciempleado = :ci
            ORDER BY h.dia, b.horainicio
        """),
        {"ci": ci},
    ).mappings().all()

    pdf_content = crear_pdf_horario_docente(ci, [dict(r) for r in rows])
    filename = f"horario_docente_{ci}.pdf"
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )