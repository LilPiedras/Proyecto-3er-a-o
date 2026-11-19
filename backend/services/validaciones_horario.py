from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException, status
from datetime import datetime

def parse_hora(hora_str: str):
    """Convierte string de hora a time. Soporta muchos formatos comunes."""
    if not hora_str:
        return None

    hora_str = str(hora_str).strip().upper()

    formatos = [
        "%I:%M %p",      # 7:45 AM
        "%I:%M%p",       # 7:45AM
        "%H:%M",         # 07:45 o 19:45
        "%H:%M:%S",      # 07:45:00
        "%I:%M:%S %p",   # 7:45:00 AM
        "%H.%M",         # 7.45
        "%I.%M %p",      # 7.45 AM
    ]

    for fmt in formatos:
        try:
            return datetime.strptime(hora_str, fmt).time()
        except ValueError:
            continue

    raise HTTPException(
        status_code=400,
        detail=f"Formato de hora inválido: '{hora_str}'. Formatos aceptados: 7:45 AM, 07:45, 19:45, etc."
    )

def se_solapan(inicio1, fin1, inicio2, fin2) -> bool:
    return inicio1 < fin2 and inicio2 < fin1

def validar_choque_horario_docente(db: Session, ci_docente: str, idhorario: int, excluir_asignacion_id: int | None = None):

    horario_nuevo = db.execute(
        text("""
            SELECT h.idhorario, h.dia, h.salon, b.horainicio, b.horafin
            FROM horario h
            JOIN bloque b ON h.bloque = b.idbloque
            WHERE h.idhorario = :idhorario AND h.activo = TRUE
        """),
        {"idhorario": idhorario}
    ).fetchone()

    if not horario_nuevo:
        raise HTTPException(status_code=404, detail="El horario seleccionado no existe o está inactivo")

    dia_nuevo = horario_nuevo.dia
    inicio_nuevo = parse_hora(horario_nuevo.horainicio)
    fin_nuevo = parse_hora(horario_nuevo.horafin)

    query = """
        SELECT
            ad.id_asignacion_docente,
            h.idhorario,
            h.dia,
            h.salon,
            b.horainicio,
            b.horafin,
            m.nombremateria,
            s.nomsecc
        FROM asignacion_docente ad
        JOIN horario h ON ad.horario_id = h.idhorario
        JOIN bloque b ON h.bloque = b.idbloque
        JOIN materia m ON ad.materia_id = m.idmateria
        JOIN seccion s ON ad.seccion_id = s.idsecc
        WHERE ad.empleado_id = :ci_docente
          AND ad.activo = TRUE
          AND h.activo = TRUE
          AND h.dia = :dia
    """
    params = {"ci_docente": ci_docente, "dia": dia_nuevo}

    if excluir_asignacion_id:
        query += " AND ad.id_asignacion_docente != :excluir_id"
        params["excluir_id"] = excluir_asignacion_id

    choques = db.execute(text(query), params).fetchall()

    for choque in choques:
        inicio_existente = parse_hora(choque.horainicio)
        fin_existente = parse_hora(choque.horafin)

        if se_solapan(inicio_nuevo, fin_nuevo, inicio_existente, fin_existente):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"Choque de horario detectado. "
                    f"El docente ya tiene clase de '{choque.nombremateria}' "
                    f"(Sección {choque.nomsecc}) el día {choque.dia} "
                    f"de {choque.horainicio} a {choque.horafin} en el salón {choque.salon}."
                )
            )

    return True