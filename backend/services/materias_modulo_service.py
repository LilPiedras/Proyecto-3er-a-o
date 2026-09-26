from models.materias_modulo_model import *
from Schemas.materias_modulo_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def listar_materias_por_modulo(db: Session):
    mateo = db.query(Materias_Modulo).all()
    if not mateo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin asignar")
    return mateo

def crear_oferta(mateo: MateriaModuloEntrada, db:Session):
    mateo = Materias_Modulo(idmateria = mateo.idmateria,
                            idmodulo = mateo.idmodulo
                    )
    db.add(mateo)
    db.commit()
    db.refresh(mateo)
    return mateo

def actualizar_materias_modulo_parcial(idmatemo: int, mamemon: MateriaModuloActualizar, db: Session):
    db_matemo = db.query(Materias_Modulo).filter(Materias_Modulo.idmatemo == idmatemo).first()
    if not db_matemo:
        raise HTTPException(status_code=404, detail="Horario no encontrado")

    update_data = mamemon.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_matemo, key, value)

def eliminar_materia_modulo(idmatemo: int, db: Session):
    db_oferta = db.query(Materias_Modulo).filter(Materias_Modulo.idmatemo == idmatemo).first()
    if not db_oferta:
        raise HTTPException(status_code=404, detail="La asignacion no fue encontrada")

    db_oferta.activo = False
    db.commit()
    return None