import traceback
from typing import Union
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database.connection import get_db
from services.validaciones_horario import validar_choque_horario_docente

hrouter = APIRouter(
    prefix="/api",
    tags=["Horarios y Oferta"]
)

class AsignacionSchema(BaseModel):
    idmateria: Union[int, str]
    ciempleado: Union[int, str]
    idmodulo: Union[int, str]
    idhorario: Union[int, str]
    idcarrera: Union[int, str]
    idsecc: Union[int, str]

@hrouter.get("/horarios-materias")
def obtener_horarios_materias(db: Session = Depends(get_db)):
    try:
        query = text("""
            SELECT
                os.idseccmo,
                m.idmateria,
                COALESCE(m.nombremateria, 'Oferta académica #' || os.idseccmo::text) AS materia,
                COALESCE(mod.nombremodulo, 'Sin módulo') AS modulo,
                COALESCE(e.nombreempleado || ' ' || e.apellidoempleado, 'Sin docente asignado') AS docente,
                e.ciempleado,
                COALESCE(h.dia, 'Por definir') AS dia,
                COALESCE(h.salon, 'S/N') AS salon,
                COALESCE(b.horainicio::text, '--:--') AS horainicio,
                COALESCE(b.horafin::text, '--:--') AS horafin,
                os.idsecc,
                COALESCE(s.nomsecc, 'Sin sección') AS seccion,
                os.idcarrera,
                COALESCE(c.nombrecarrera, 'Sin carrera') AS carrera
            FROM public.oferta_seccion os
            LEFT JOIN public.horario h ON os.horario = h.idhorario
            LEFT JOIN public.bloque b ON h.bloque = b.idbloque
            LEFT JOIN public.seccion s ON s.idsecc = os.idsecc
            LEFT JOIN public.carrera c ON c.idcarrera = os.idcarrera
            LEFT JOIN public.carrera_modulo cm ON cm.idcarremo = os.idcarremo
            LEFT JOIN public.materias_modulo mm ON mm.idmatemo = cm.idmatemo
            LEFT JOIN public.materia m ON m.idmateria = mm.idmateria
            LEFT JOIN public.modulo mod ON mod.idmodulo = mm.idmodulo
            LEFT JOIN public.empleado e ON m.docente = e.ciempleado
            WHERE os.horario IS NOT NULL
            ORDER BY os.idseccmo DESC
        """)
        resultado = db.execute(query).fetchall()

        return [
            {
                "idseccmo": row[0],
                "idmateria": row[1],
                "materia": row[2],
                "modulo": row[3],
                "docente": row[4],
                "ciempleado": row[5],
                "dia": row[6],
                "salon": row[7],
                "horainicio": str(row[8]),
                "horafin": str(row[9]),
                "idsecc": row[10],
                "seccion": row[11],
                "idcarrera": row[12],
                "carrera": row[13],
            }
            for row in resultado
        ]
    except Exception as e:
        print("--- ERROR EN GET /horarios-materias ---")
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)


@hrouter.post("/asignar-horario")
def asignar_horario_materia(datos: AsignacionSchema, db: Session = Depends(get_db)):
    try:
        
        idmateria = int(datos.idmateria)
        ciempleado = str(datos.ciempleado).strip()
        idmodulo = int(datos.idmodulo)
        idhorario = int(datos.idhorario)
        idcarrera = int(datos.idcarrera)
        idsecc = int(datos.idsecc)

        validar_choque_horario_docente(
            db=db,
            ci_docente=ciempleado,
            idhorario=idhorario
        )

        db.execute(
            text("UPDATE materia SET docente = :docente WHERE idmateria = :idmateria"),
            {"docente": ciempleado, "idmateria": idmateria},
        )

        mm = db.execute(
            text("""
                SELECT idmatemo FROM materias_modulo
                WHERE idmateria = :idmateria AND idmodulo = :idmodulo
                LIMIT 1
            """),
            {"idmateria": idmateria, "idmodulo": idmodulo},
        ).fetchone()

        if mm:
            idmatemo = mm[0]
        else:
            mm_any = db.execute(
                text("SELECT idmatemo FROM materias_modulo WHERE idmateria = :idmateria LIMIT 1"),
                {"idmateria": idmateria},
            ).fetchone()
            if mm_any:
                db.execute(
                    text("UPDATE materias_modulo SET idmodulo = :idmodulo WHERE idmatemo = :idmatemo"),
                    {"idmodulo": idmodulo, "idmatemo": mm_any[0]},
                )
                idmatemo = mm_any[0]
            else:
                idmatemo = db.execute(
                    text("""
                        INSERT INTO materias_modulo (idmateria, idmodulo)
                        VALUES (:idmateria, :idmodulo)
                        RETURNING idmatemo
                    """),
                    {"idmateria": idmateria, "idmodulo": idmodulo},
                ).scalar()

        cm = db.execute(
            text("""
                SELECT idcarremo FROM carrera_modulo
                WHERE idmatemo = :idmatemo AND idcarrera = :idcarrera
                LIMIT 1
            """),
            {"idmatemo": idmatemo, "idcarrera": idcarrera},
        ).fetchone()

        if cm:
            idcarremo = cm[0]
            db.execute(
                text("UPDATE carrera_modulo SET activo = TRUE WHERE idcarremo = :id"),
                {"id": idcarremo},
            )
        else:
            idcarremo = db.execute(
                text("""
                    INSERT INTO carrera_modulo (idmatemo, idcarrera, activo)
                    VALUES (:idmatemo, :idcarrera, TRUE)
                    RETURNING idcarremo
                """),
                {"idmatemo": idmatemo, "idcarrera": idcarrera},
            ).scalar()

        oferta = db.execute(
            text("""
                SELECT idseccmo FROM oferta_seccion
                WHERE idcarrera = :idcarrera
                  AND idsecc = :idsecc
                  AND horario = :idhorario
                  AND idcarremo = :idcarremo
                  AND estudiante IS NULL
                LIMIT 1
            """),
            {
                "idcarrera": idcarrera,
                "idsecc": idsecc,
                "idhorario": idhorario,
                "idcarremo": idcarremo,
            },
        ).fetchone()

        if oferta:
            idseccmo = oferta[0]
            db.execute(
                text("""
                    UPDATE oferta_seccion
                    SET horario = :idhorario, idcarremo = :idcarremo
                    WHERE idseccmo = :idseccmo
                """),
                {"idhorario": idhorario, "idcarremo": idcarremo, "idseccmo": idseccmo},
            )
        else:
            idseccmo = db.execute(
                text("""
                    INSERT INTO oferta_seccion (idcarrera, idsecc, horario, idcarremo)
                    VALUES (:idcarrera, :idsecc, :idhorario, :idcarremo)
                    RETURNING idseccmo
                """),
                {
                    "idcarrera": idcarrera,
                    "idsecc": idsecc,
                    "idhorario": idhorario,
                    "idcarremo": idcarremo,
                },
            ).scalar()

        db.commit()
        return JSONResponse(
            content={
                "mensaje": "Asignación guardada correctamente",
                "idseccmo": idseccmo,
                "idcarremo": idcarremo,
                "idmatemo": idmatemo,
            },
            status_code=200,
        )

    except Exception as e:
        db.rollback()
        print("--- ERROR EN POST /asignar-horario ---")
        traceback.print_exc()
        return JSONResponse(content={"error_detalle": str(e)}, status_code=400)