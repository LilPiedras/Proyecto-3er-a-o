from sqlalchemy.orm import Session
from models.asistencia_model import Asistencias
from Schemas.asistencia_schema import AsistenciaEntrada
from datetime import date

def tomar_asistencia(asistencia_in: AsistenciaEntrada, db: Session):
    asistencia = Asistencias(
        asisestu=asistencia_in.asisestu,
        idmateria=asistencia_in.idmateria,
        fecha=asistencia_in.fecha,
        verificar=asistencia_in.verificar
    )
    db.add(asistencia)
    db.commit()
    db.refresh(asistencia)
    return asistencia

def listar_asistencia_por_materia(idmateria: int, fecha_consulta: date, db: Session):
    return db.query(Asistencias).filter(
        Asistencias.idmateria == idmateria,
        Asistencias.fecha == fecha_consulta
    ).all()