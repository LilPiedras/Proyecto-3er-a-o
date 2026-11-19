from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException, status
from datetime import datetime

def parse_hora(hora_str: str):
    if not hora_str:
        return None

    hora_str = str(hora_str).strip().upper()

    formatos = [
        "%I:%M %p",
        "%I:%M%p",
        "%H:%M",
        "%H:%M:%S",
        "%I:%M:%S %p",
        "%H.%M",
        "%I.%M %p",
    ]

    for fmt in formatos:
        try:
            return datetime.strptime(hora_str, fmt).time()
        except ValueError:
            continue

    raise HTTPException(
        status_code=400,
        detail=f"Formato de hora inválido: '{hora_str}'"
    )

def se_solapan(inicio1, fin1, inicio2, fin2) -> bool:
    return inicio1 < fin2 and inicio2 < fin1

def validar_choque_horario_docente(
    db: Session,
    ci_docente: str,
    idhorario: int,
    excluir_idseccmo: int | None = None
):
    horario_nuevo = db.execute(
        text("""
            SELECT h.idhorario, h.dia, h.salon, b.horainicio, b.horafin
            FROM horario h
            JOIN bloque b ON h.bloque = b.idbloque
            WHERE h.idhorario = :idhorario AND COALESCE(h.activo, TRUE) = TRUE
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
            os.idseccmo,
            h.dia,
            h.salon,
            b.horainicio,
            b.horafin,
            COALESCE(m.nombremateria, 'Sin nombre') AS nombremateria,
            COALESCE(s.nomsecc, 'Sin sección') AS nomsecc
        FROM oferta_seccion os
        JOIN horario h ON os.horario = h.idhorario
        JOIN bloque b ON h.bloque = b.idbloque
        LEFT JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
        LEFT JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
        LEFT JOIN materia m ON m.idmateria = mm.idmateria
        LEFT JOIN seccion s ON s.idsecc = os.idsecc
        WHERE m.docente = :ci_docente
          AND COALESCE(h.activo, TRUE) = TRUE
          AND h.dia = :dia
          AND os.horario IS NOT NULL
    """
    params = {"ci_docente": ci_docente, "dia": dia_nuevo}

    if excluir_idseccmo:
        query += " AND os.idseccmo != :excluir_id"
        params["excluir_id"] = excluir_idseccmo

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