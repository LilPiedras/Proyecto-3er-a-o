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
                COALESCE(b.horafin, '--:--') AS horafin
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
            }
            for row in resultado
        ]
    except Exception as e:
        print("--- ERROR EN GET /horarios-materias ---")
        traceback.print_exc()
        return JSONResponse(content={"error": str(e)}, status_code=500)

@hrouter.post("/asignar-horario")
def asignar_horario_materia(
    datos: AsignacionSchema,
    db: Session = Depends(get_db)
):
    try:
        idmateria = int(datos.idmateria)
        ciempleado = str(datos.ciempleado).strip()
        idmodulo = int(datos.idmodulo)
        idhorario = int(datos.idhorario)

        db.execute(
            text("UPDATE materia SET docente = :docente WHERE idmateria = :idmateria"),
            {"docente": ciempleado, "idmateria": idmateria}
        )

        existe = db.execute(
            text("SELECT idmatemo FROM materias_modulo WHERE idmateria = :idmateria LIMIT 1"),
            {"idmateria": idmateria}
        ).fetchone()

        if existe:
            db.execute(
                text("""
                    UPDATE materias_modulo
                    SET idmodulo = :idmodulo
                    WHERE idmateria = :idmateria
                """),
                {"idmodulo": idmodulo, "idmateria": idmateria}
            )
        else:
            db.execute(
                text("""
                    INSERT INTO materias_modulo (idmateria, idmodulo)
                    VALUES (:idmateria, :idmodulo)
                """),
                {"idmateria": idmateria, "idmodulo": idmodulo}
            )

        idcarrera = int(datos.idcarrera) if datos.idcarrera else None
        idsecc = int(datos.idsecc) if datos.idsecc else None

        if not idcarrera or not idsecc:
            carrera_row = db.execute(text("SELECT idcarrera FROM carrera LIMIT 1")).fetchone()
            seccion_row = db.execute(text("SELECT idsecc FROM seccion LIMIT 1")).fetchone()

            if carrera_row and seccion_row:
                idcarrera = carrera_row[0]
                idsecc = seccion_row[0]
            else:
                raise Exception("No existen carreras o secciones registradas en la base de datos.")

        oferta_existente = db.execute(
            text("""
                SELECT idseccmo FROM oferta_seccion
                WHERE idcarrera = :idcarrera AND idsecc = :idsecc
                LIMIT 1
            """),
            {"idcarrera": idcarrera, "idsecc": idsecc}
        ).fetchone()

        if oferta_existente:
            db.execute(
                text("""
                    UPDATE oferta_seccion
                    SET horario = :idhorario
                    WHERE idseccmo = :idseccmo
                """),
                {"idhorario": idhorario, "idseccmo": oferta_existente[0]}
            )
        else:
            db.execute(
                text("""
                    INSERT INTO oferta_seccion (idcarrera, idsecc, horario)
                    VALUES (:idcarrera, :idsecc, :idhorario)
                """),
                {"idcarrera": idcarrera, "idsecc": idsecc, "idhorario": idhorario}
            )

        db.commit()
        return JSONResponse(
            content={"mensaje": "Asignación guardada correctamente"},
            status_code=200
        )

    except Exception as e:
        db.rollback()
        print("--- ERROR EN POST /asignar-horario ---")
        traceback.print_exc()
        return JSONResponse(content={"error_detalle": str(e)}, status_code=400)