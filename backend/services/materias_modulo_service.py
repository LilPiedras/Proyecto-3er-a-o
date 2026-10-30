from models.materias_modulo_model import *
from models.materias_model import Materias
from models.modulo_model import Modulo
from models.carrera_modulo_model import Carrera_Modulo
from Schemas.materias_modulo_schema import *
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException

def _consulta_relaciones(db: Session):
    return (
        db.query(
            Materias_Modulo.idmatemo,
            Materias_Modulo.idmateria,
            Materias_Modulo.idmodulo,
            Materias.nombremateria,
            Modulo.nombremodulo,
        )
        .join(Materias, Materias.idmateria == Materias_Modulo.idmateria)
        .join(Modulo, Modulo.idmodulo == Materias_Modulo.idmodulo)
    )

def listar_materias_por_modulo(db: Session):
    return _consulta_relaciones(db).order_by(Modulo.nombremodulo, Materias.nombremateria).all()

def crear_oferta(mateo: MateriaModuloEntrada, db:Session):
    mateo = Materias_Modulo(idmateria = mateo.idmateria,
                            idmodulo = mateo.idmodulo
                    )
    db.add(mateo)
    db.commit()
    db.refresh(mateo)
    return _consulta_relaciones(db).filter(Materias_Modulo.idmatemo == mateo.idmatemo).one()

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

    relacion_carrera = db.query(Carrera_Modulo.idcarremo).filter(
        Carrera_Modulo.idmatemo == idmatemo
    ).first()
    if relacion_carrera:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede desvincular: esta materia del módulo está asociada a una carrera. Elimina primero esa relación académica.",
        )

    try:
        db.delete(db_oferta)
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se puede desvincular porque la relación todavía está siendo utilizada.",
        ) from error
    return None