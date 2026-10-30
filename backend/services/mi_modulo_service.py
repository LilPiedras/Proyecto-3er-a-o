from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text

from models.usuario_model import Usuario
from models.oferta_seccion_model import Oferta_seccion
from models.notas_model import Notas
from models.inscripcion_model import Inscripcion
from models.detalle_inscripcion_model import Detalle_Inscripcion
from models.seccion_model import Seccion

def obtener_mi_modulo(current_user: Usuario, db: Session) -> dict:
    ciestu = current_user.estudiante
    if not ciestu:
        ciestu = current_user.ciuser

    ofertas = (db.query(Oferta_seccion).filter(Oferta_seccion.estudiante == ciestu).all())

    inscripcion = (
        db.query(Inscripcion).filter(Inscripcion.ciestu == ciestu, Inscripcion.activo.is_(True)).order_by(Inscripcion.id.desc()).first())

    secciones_info = []
    if inscripcion:
        for det in inscripcion.detalles:
            if not det.activo:
                continue
            seccion = (db.query(Seccion).filter(Seccion.idsecc == det.seccion_id).first())
            secciones_info.append({
                "seccion_id": det.seccion_id,
                "nombre_seccion": seccion.nomsecc if seccion else f"Sección {det.seccion_id}",
            })

    query_materias = text("""
        SELECT DISTINCT
            m.idmateria,
            m.nombremateria,
            COALESCE(e.nombreempleado || ' ' || e.apellidoempleado, 'Sin docente') AS docente,
            mod.idmodulo,
            mod.nombremodulo,
            os.idseccmo,
            os.idsecc,
            s.nomsecc,
            h.idhorario,
            COALESCE(h.dia, 'Por definir') AS dia,
            COALESCE(h.salon, 'S/N') AS salon,
            COALESCE(b.horainicio, '--:--') AS horainicio,
            COALESCE(b.horafin, '--:--') AS horafin
        FROM oferta_seccion os
        LEFT JOIN seccion s ON s.idsecc = os.idsecc
        LEFT JOIN horario h ON h.idhorario = os.horario
        LEFT JOIN bloque b ON b.idbloque = h.bloque
        LEFT JOIN carrera_modulo cm ON cm.idcarremo = os.idcarremo
        LEFT JOIN materias_modulo mm ON mm.idmatemo = cm.idmatemo
        LEFT JOIN materia m ON m.idmateria = mm.idmateria AND m.activo IS TRUE
        LEFT JOIN modulo mod ON mod.idmodulo = mm.idmodulo
        LEFT JOIN empleado e ON e.ciempleado = m.docente
        WHERE os.estudiante = :ciestu
        ORDER BY mod.nombremodulo NULLS LAST, m.nombremateria NULLS LAST
    """)

    rows = db.execute(query_materias, {"ciestu": ciestu}).fetchall()

    materias = []
    horarios = []
    modulos_vistos = {}
    seen_horario = set()

    for row in rows:
        (
            idmateria, nombremateria, docente,
            idmodulo, nombremodulo,
            idseccmo, idsecc, nomsecc,
            idhorario, dia, salon, horainicio, horafin
        ) = row

        if idmodulo and idmodulo not in modulos_vistos:
            modulos_vistos[idmodulo] = {
                "idmodulo": idmodulo,
                "nombremodulo": nombremodulo or f"Módulo {idmodulo}",
            }

        if idmateria:
            materias.append({
                "idmateria": idmateria,
                "nombremateria": nombremateria,
                "docente": docente,
                "idmodulo": idmodulo,
                "nombremodulo": nombremodulo,
                "idseccmo": idseccmo,
                "idsecc": idsecc,
                "nombre_seccion": nomsecc,
                "dia": dia,
                "salon": salon,
                "horainicio": str(horainicio) if horainicio else None,
                "horafin": str(horafin) if horafin else None,
            })

        key = (idhorario, dia, salon, horainicio, horafin, idmateria)
        if idhorario and key not in seen_horario:
            seen_horario.add(key)
            horarios.append({
                "idhorario": idhorario,
                "dia": dia,
                "salon": salon,
                "horainicio": str(horainicio) if horainicio else "--:--",
                "horafin": str(horafin) if horafin else "--:--",
                "materia": nombremateria,
                "docente": docente,
                "seccion": nomsecc,
            })

    if not materias and ofertas:
        for of in ofertas:
            h = of.horario_rel
            if h:
                bloque = db.execute(
                    text("SELECT horainicio, horafin FROM bloque WHERE idbloque = :id"),
                    {"id": h.bloque},
                ).fetchone()
                horarios.append({
                    "idhorario": h.idhorario,
                    "dia": h.dia,
                    "salon": h.salon,
                    "horainicio": str(bloque[0]) if bloque else "--:--",
                    "horafin": str(bloque[1]) if bloque else "--:--",
                    "materia": None,
                    "docente": None,
                    "seccion": of.seccion_rel.nomsecc if of.seccion_rel else None,
                })

    notas_query = (db.query(Notas).join(Oferta_seccion, Notas.oferta == Oferta_seccion.idseccmo).filter(Oferta_seccion.estudiante == ciestu, Notas.activo.is_(True)).all())

    notas = []
    for n in notas_query:
        titulo_eval = None
        idmateria = None
        nombremateria = None
        if n.idevaluacion and n.plan_evaluacion:
            titulo_eval = n.plan_evaluacion.titulo
            idmateria = n.plan_evaluacion.idmateria
            mat = db.execute(
                text("SELECT nombremateria FROM materia WHERE idmateria = :id"),
                {"id": idmateria},
            ).fetchone()
            if mat:
                nombremateria = mat[0]

        notas.append({
            "idnota": n.idnota,
            "calificacion": float(n.notas) if n.notas is not None else None,
            "fechanota": n.fechanota.isoformat() if n.fechanota else None,
            "oferta": n.oferta,
            "idevaluacion": n.idevaluacion,
            "titulo_evaluacion": titulo_eval,
            "idmateria": idmateria,
            "nombremateria": nombremateria,
        })

    modulo_actual = None
    if modulos_vistos:
        modulo_actual = list(modulos_vistos.values())[0]
    elif secciones_info:
        modulo_actual = {
            "idmodulo": None,
            "nombremodulo": secciones_info[-1]["nombre_seccion"],
        }

    if not ofertas and not inscripcion and not notas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No se encontró información académica para este estudiante. "
                   "Verifica que tengas oferta o inscripción asignada.",
        )

    return {
        "ciestu": ciestu,
        "nombre": current_user.nombreusuario,
        "apellido": current_user.apellusuario,
        "modulo": modulo_actual,
        "secciones": secciones_info,
        "materias": materias,
        "horarios": horarios,
        "notas": notas,
        "inscripcion": {
            "id": inscripcion.id if inscripcion else None,
            "estado": inscripcion.estado if inscripcion else None,
            "periodo_id": inscripcion.periodo_id if inscripcion else None,
            "fecha_inscripcion": (
                inscripcion.fecha_inscripcion.isoformat()
                if inscripcion and inscripcion.fecha_inscripcion
                else None
            ),
        } if inscripcion else None,
    }