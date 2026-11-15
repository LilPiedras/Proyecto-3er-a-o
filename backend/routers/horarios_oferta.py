import traceback
from typing import Union, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from database.connection import get_db

hrouter = APIRouter(
    prefix="/api",
    tags=["Horarios y Oferta"]
)

class AsignacionSchema(BaseModel):
    idmateria: Union[int, str]
    ciempleado: Union[int, str]
    idmodulo: Union[int, str]
    idhorario: Union[int, str]
    idcarrera: Optional[Union[int, str]] = None
    idsecc: Optional[Union[int, str]] = None

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
                COALESCE(h.dia, 'Por definir') AS dia,
                COALESCE(h.salon, 'S/N') AS salon,
                COALESCE(b.horainicio, '--:--') AS horainicio,
                COALESCE(b.horafin, '--:--') AS horafin,
                e.ciempleado AS ciempleado
            FROM public.oferta_seccion os
            LEFT JOIN public.horario h ON os.horario = h.idhorario
            LEFT JOIN public.bloque b ON h.bloque = b.idbloque
            LEFT JOIN public.carrera_modulo cm ON cm.idcarremo = os.idcarremo
            LEFT JOIN public.materias_modulo mm ON mm.idmatemo = cm.idmatemo
            LEFT JOIN public.materia m ON m.idmateria = mm.idmateria
            LEFT JOIN public.modulo mod ON mod.idmodulo = mm.idmodulo
            LEFT JOIN public.empleado e ON m.docente = e.ciempleado
            WHERE os.horario IS NOT NULL
            ORDER BY os.idseccmo DESC;
        """)
        resultado = db.execute(query).fetchall()

        return [
            {
                "idseccmo": row[0],
                "idmateria": row[1],
                "materia": row[2],
                "modulo": row[3],
                "docente": row[4],
                "dia": row[5],
                "salon": row[6],
                "horainicio": str(row[7]),
                "horafin": str(row[8]),
                "ciempleado": row[9],
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

        db.execute(
            text("UPDATE materia SET docente = :docente WHERE idmateria = :idmateria"),
            {"docente": ciempleado, "idmateria": idmateria}
        )

        matemo = db.execute(
            text("""
                SELECT idmatemo FROM materias_modulo
                WHERE idmateria = :idmateria AND idmodulo = :idmodulo
                LIMIT 1
            """),
            {"idmateria": idmateria, "idmodulo": idmodulo}
        ).fetchone()

        if matemo:
            idmatemo = matemo[0]
        else:

            existente = db.execute(text("SELECT idmatemo FROM materias_modulo WHERE idmateria = :idmateria LIMIT 1"), {"idmateria": idmateria}).fetchone()

            if existente:
                db.execute(
                    text("UPDATE materias_modulo SET idmodulo = :idmodulo WHERE idmatemo = :idmatemo"),
                    {"idmodulo": idmodulo, "idmatemo": existente[0]}
                )
                idmatemo = existente[0]
            else:
                row = db.execute(
                    text("""
                        INSERT INTO materias_modulo (idmateria, idmodulo)
                        VALUES (:idmateria, :idmodulo)
                        RETURNING idmatemo
                    """),
                    {"idmateria": idmateria, "idmodulo": idmodulo}).fetchone()
                idmatemo = row[0]

        idcarrera = int(datos.idcarrera) if datos.idcarrera else None
        idsecc = int(datos.idsecc) if datos.idsecc else None

        if not idcarrera:
            carrera_row = db.execute(text("SELECT idcarrera FROM carrera LIMIT 1")).fetchone()
            if not carrera_row:
                raise Exception("No existen carreras registradas.")
            idcarrera = carrera_row[0]

        if not idsecc:
            seccion_row = db.execute(text("SELECT idsecc FROM seccion LIMIT 1")).fetchone()
            if not seccion_row:
                raise Exception("No existen secciones registradas.")
            idsecc = seccion_row[0]

        carremo = db.execute(
            text("""
                SELECT idcarremo FROM carrera_modulo
                WHERE idmatemo = :idmatemo AND idcarrera = :idcarrera
                LIMIT 1
            """),
            {"idmatemo": idmatemo, "idcarrera": idcarrera}
        ).fetchone()

        if carremo:
            idcarremo = carremo[0]
            db.execute(
                text("UPDATE carrera_modulo SET activo = true WHERE idcarremo = :idcarremo"),
                {"idcarremo": idcarremo}
            )
        else:
            row = db.execute(
                text("""
                    INSERT INTO carrera_modulo (idmatemo, idcarrera, activo)
                    VALUES (:idmatemo, :idcarrera, true)
                    RETURNING idcarremo
                """),
                {"idmatemo": idmatemo, "idcarrera": idcarrera}
            ).fetchone()
            idcarremo = row[0]

        oferta = db.execute(
            text("""
                SELECT idseccmo FROM oferta_seccion
                WHERE idcarrera = :idcarrera
                  AND idsecc = :idsecc
                  AND (idcarremo = :idcarremo OR idcarremo IS NULL)
                ORDER BY idseccmo DESC
                LIMIT 1
            """),
            {"idcarrera": idcarrera, "idsecc": idsecc, "idcarremo": idcarremo}
        ).fetchone()

        if oferta:
            db.execute(
                text("""
                    UPDATE oferta_seccion
                    SET horario = :idhorario,
                        idcarremo = :idcarremo
                    WHERE idseccmo = :idseccmo
                """),
                {
                    "idhorario": idhorario,
                    "idcarremo": idcarremo,
                    "idseccmo": oferta[0],
                }
            )
            idseccmo = oferta[0]
        else:
            row = db.execute(
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
                }
            ).fetchone()
            idseccmo = row[0]

        try:
            ya = db.execute(
                text("""
                    SELECT id_asignacion_docente FROM asignacion_docente
                    WHERE empleado_id = :ci
                      AND materia_id = :mat
                      AND seccion_id = :secc
                    LIMIT 1
                """),
                {"ci": ciempleado, "mat": idmateria, "secc": idsecc}
            ).fetchone()

            if not ya:
                db.execute(
                    text("""
                        INSERT INTO asignacion_docente
                            (empleado_id, materia_id, seccion_id, fecha_asignacion, horario_id, activo)
                        VALUES
                            (:ci, :mat, :secc, CURRENT_DATE::text, :horario, true)
                    """),
                    {
                        "ci": ciempleado,
                        "mat": idmateria,
                        "secc": idsecc,
                        "horario": idhorario,
                    }
                )
            else:
                db.execute(
                    text("""
                        UPDATE asignacion_docente
                        SET horario_id = :horario, activo = true
                        WHERE id_asignacion_docente = :id
                    """),
                    {"horario": idhorario, "id": ya[0]}
                )
        except Exception:
            pass

        db.commit()
        return JSONResponse(
            content={
                "mensaje": "Asignación guardada correctamente",
                "idseccmo": idseccmo,
                "idcarremo": idcarremo,
                "idmatemo": idmatemo,
            },
            status_code=200
        )

    except Exception as e:
        db.rollback()
        print("--- ERROR EN POST /asignar-horario ---")
        traceback.print_exc()
        return JSONResponse(content={"error_detalle": str(e)}, status_code=400)