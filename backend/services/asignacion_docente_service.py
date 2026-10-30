from models.asignacion_docente_model import *
from Schemas.asignacion_docente_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_asignacion_de_materia_por_id(id_asignacion_docente:int, db:Session):
    asig = db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente, Asignacion_Docente.activo == True).first()
    if asig is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La asignacion del docente no fue encontrado")
    return asig

def listar_docentes_asignados(db: Session):
    asig = db.query(Asignacion_Docente).filter(Asignacion_Docente.activo == True).all()
    if not asig:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin asignaciones")
    return asig

def crear_nueva_asignacion(asig: AsigmentDocEntrada, db:Session):
    asig = Asignacion_Docente(empleado_id  = asig.empleado_id,
                     materia_id = asig.materia_id,
                     seccion_id = asig.seccion_id,
                     fecha_asignacion = asig.fecha_asignacion)
    db.add(asig)
    db.commit()
    db.refresh(asig)
    return asig

def actualizar_asignaciones_completo(id_asignacion_docente: int, agumon_uodata: AsigmentDocEntrada, db: Session):
    db_si = db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente).first()
    if not db_si:
        raise HTTPException(status_code=404, detail="El horario no existe o pudo ser encontrado")

    for key, value in agumon_uodata.model_dump(exclude_unset=True).items():
        setattr(db_si, key, value)

    db.commit()
    db.refresh(db_si)
    return db_si

def actualizar_horario_parcial(id_asignacion_docente: int, agumon_updata: AsigmentDocUpdate, db: Session):
    db_toy = db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente).first()
    if not db_toy:
        raise HTTPException(status_code=404, detail="La asignacion no fue encontrada")

    update_data = agumon_updata.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_toy, key, value)

    db.commit()
    db.refresh(db_toy)
    return db_toy

def eliminar_asig(id_asignacion_docente: int, db: Session):
    db_si = db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente, Asignacion_Docente.activo==True).first()
    if not db_si:
        raise HTTPException(status_code=404, detail="La asignacion no fue encontrada")

    db_si.activo = False
    db.commit()
    return None