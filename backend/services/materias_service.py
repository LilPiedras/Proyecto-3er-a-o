from models.materias_model import *
from Schemas.materias_chema import  *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_materia_por_id(idmateria:int, db:Session):
    materia = db.query(Materias).filter(Materias.idmateria == idmateria, Materias.activo == True).first()
    if materia is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La materia no fue encontrado")
    return materia

def listar_materias_horarios(db: Session):
    materia = db.query(Materias).filter(Materias.activo == True).all()
    if not materia:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de materias vacia")
    return materia

def crear_materia(materia: MateriasEntrada, db:Session):
    materia = Materias(nombremateria  = materia.nombremateria,
                     docente = materia.docente)
    db.add(materia)
    db.commit()
    db.refresh(materia)
    return materia

def actualizar__completo(idmateria: int, materia_updata: MateriasEntrada, db: Session):
    db_materia = db.query(Materias).filter(Materias.idmateria == idmateria).first()
    if not db_materia:
        raise HTTPException(status_code=404, detail="La materia no existe o pudo ser encontrado")

    for key, value in materia_updata.model_dump(exclude_unset=True).items():
        setattr(db_materia, key, value)

    db.commit()
    db.refresh(db_materia)
    return db_materia

def actualizar_materia_parcial(idmateria: int, materia_update: MateriasActualizar, db: Session):
    db_materia = db.query(Materias).filter(Materias.idmateria == idmateria).first()
    if not db_materia:
        raise HTTPException(status_code=404, detail="La materia no fue encontrado")

    update_data = materia_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_materia, key, value)

    db.commit()
    db.refresh(db_materia)
    return db_materia

def eliminar_materia(idmateria: int, db: Session):
    db_materia = db.query(Materias).filter(Materias.idmateria == idmateria, Materias.activo==True).first()
    if not db_materia:
        raise HTTPException(status_code=404, detail="La materia no fue encontrada")

    db_materia.activo = False
    db.commit()
    return None