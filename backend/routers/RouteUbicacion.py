from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.connection import SessionLocal
from models.inscripcion_model import Inscripcion
from models.detalle_inscripcion_model import Detalle_Inscripcion
from models.seccion_model import Seccion
from models.oferta_seccion_model import Oferta_seccion
from models.carrera_model import Carrera
from models.carrera_modulo_model import Carrera_Modulo
from models.materias_modulo_model import Materias_Modulo
from models.materias_model import Materias

router = APIRouter(
    prefix="/Ubicacion",
    tags=["Ubicacion"]
)


# Ejemplo de ruta para consultar la ubicación académica de un estudiante
@router.get("/estudiante/{ciestu}/ubicacion-academica")
def obtener_ubicacion_estudiante(ciestu: str, db: Session = Depends(get_db)):
    # 1. Buscar inscripciones activas del estudiante
    inscripciones = db.query(Inscripcion).filter(
        Inscripcion.ciestu == ciestu, 
        Inscripcion.activo == True
    ).all()
    
    if not inscripciones:
        raise HTTPException(status_code=404, detail="El estudiante no tiene inscripciones activas.")
    
    resultado = []
    
    for ins in inscripciones:
        # 2. Recorrer los detalles de la inscripción vinculados a secciones
        for detalle in ins.detalles:
            seccion_id = detalle.seccion_id
            
            # Buscar información de la oferta o sección relacionada
            oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idsecc == seccion_id).first()
            
            carrera_nombre = "N/A"
            materia_nombre = "N/A"
            
            if oferta and oferta.idcarrera:
                carrera = db.query(Carrera).filter(Carrera.idcarrera == oferta.idcarrera).first()
                if carrera:
                    carrera_nombre = carrera.nombrecarrera
            
            if oferta and oferta.idcarremo:
                carrera_mod = db.query(Carrera_Modulo).filter(Carrera_Modulo.idcarremo == oferta.idcarremo).first()
                if carrera_mod:
                    mat_mod = db.query(Materias_Modulo).filter(Materias_Modulo.idmatemo == carrera_mod.idmatemo).first()
                    if mat_mod:
                        materia = db.query(Materias).filter(Materias.idmateria == mat_mod.idmateria).first()
                        if materia:
                            materia_nombre = materia.nombremateria

            resultado.append({
                "inscripcion_id": ins.id,
                "periodo_id": ins.periodo_id,
                "estado_inscripcion": ins.estado,
                "seccion_id": seccion_id,
                "carrera": carrera_nombre,
                "materia_o_modulo": materia_nombre
            })
            
    return {"ciestu": ciestu, "ubicacion_academica": resultado}