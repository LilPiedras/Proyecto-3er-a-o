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
            SELECT DISTINCT ON (m.idmateria)
                m.idmateria,
                m.nombremateria AS materia,
                mod.nombremodulo AS modulo,
                COALESCE(e.nombreempleado || ' ' || e.apellidoempleado, 'Sin docente asignado') AS docente,
                COALESCE(h.dia, 'Por definir') AS dia,
                COALESCE(h.salon, 'S/N') AS salon,
                COALESCE(b.horainicio, '--:--') AS horainicio,
                COALESCE(b.horafin, '--:--') AS horafin
            FROM public.materia m
            LEFT JOIN public.empleado e ON m.docente = e.ciempleado
            LEFT JOIN public.materias_modulo mm ON m.idmateria = mm.idmateria
            LEFT JOIN public.modulo mod ON mm.idmodulo = mod.idmodulo
            LEFT JOIN public.oferta_seccion os ON os.horario IS NOT NULL
            LEFT JOIN public.horario h ON os.horario = h.idhorario
            LEFT JOIN public.bloque b ON h.bloque = b.idbloque
            ORDER BY m.idmateria, os.idseccmo DESC;
        """)
        resultado = db.execute(query).fetchall()
        
        return [
            {
                "idmateria": row[0],
                "materia": row[1],
                "modulo": row[2] or "Sin módulo",
                "docente": row[3],
                "dia": row[4],
                "salon": row[5],
                "horainicio": str(row[6]),
                "horafin": str(row[7])
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
        # Parseo seguro de variables
        idmateria = int(datos.idmateria)
        ciempleado = str(datos.ciempleado).strip()
        idmodulo = int(datos.idmodulo)
        idhorario = int(datos.idhorario)

      
        db.execute(
            text("UPDATE materia SET docente = :docente WHERE idmateria = :idmateria"),
            {"docente": ciempleado, "idmateria": idmateria}
        )

       
        db.execute(
            text("DELETE FROM materias_modulo WHERE idmateria = :idmateria"),
            {"idmateria": idmateria}
        )
        db.execute(
            text("INSERT INTO materias_modulo (idmateria, idmodulo) VALUES (:idmateria, :idmodulo)"),
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

        db.execute(
            text("""
                INSERT INTO oferta_seccion (idcarrera, idsecc, horario)
                VALUES (:idcarrera, :idsecc, :idhorario);
            """),
            {"idcarrera": idcarrera, "idsecc": idsecc, "idhorario": idhorario}
        )

        db.commit()
        return JSONResponse(
            content={"mensaje": "Asignación guardada y consolidada en oferta_seccion con éxito"},
            status_code=200
        )

    except Exception as e:
        db.rollback()
        print("--- ERROR EN POST /asignar-horario ---")
        traceback.print_exc()
        return JSONResponse(content={"error_detalle": str(e)}, status_code=400)