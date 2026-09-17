from models.asistencia_model import *
from Schemas.asistencia_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_asistencia_por_ci(id_estudiante: int, db: Session):
    # Filtramos en la tabla Asistencias usando la llave foránea del estudiante
    asis = db.query(Asistencias).filter(Asistencias.id_estudiante == id_estudiante).all()
    
    if not asis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No se encontraron asistencias para el estudiante solicitado"
        )
        
    return asis

def listar_asistencias_por_oferta(oferta: int, db: Session):
    asistencias = db.query(Asistencias).filter(Asistencias.oferta == oferta).all()
    
    if not asistencias:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No se encontraron registros de asistencia para esta oferta académica"
        )
        
    return asistencias

def crear_asistencia(asis: AsistenciaEntrada, db:Session):
    asis = Asistencias(asisestu = asis.asisestu,
                     fecha = asis.fecha,
                     oferta = asis.oferta
                    )
    db.add(asis)
    db.commit()
    db.refresh(asis)
    return asis

def eliminar_asistencia(idasis: int, db: Session):
    db_asis = db.query(Asistencias).filter(Asistencias.idasis == idasis, Asistencias.activo==True).first()
    if not db_asis:
        raise HTTPException(status_code=404, detail="El curso no fue encontrado")

    db_asis.activo = False
    db.commit()
    return None