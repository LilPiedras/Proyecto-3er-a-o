from models.estudiante_model import *
from Schemas.estudiante_schema import  EstuEntrada, EstudianteSalida, EstudianteActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_estudiante_por_id(ciestu:str, db:Session):
    estudiante = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == True).first()
    if estudiante is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no fue encontrado")
    return estudiante

def listar_estudiantes(db: Session):
    estudiante = db.query(Estudiante).filter(Estudiante.activo == True).all()
    if not estudiante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de estudiante vacia")
    return estudiante

def crear_estudiante(estudiante: EstuEntrada, db:Session):
    estudiante= Estudiante(ciestu = estudiante.ciestu,
                     nombreestu = estudiante.nombreestu,
                     apelliestu = estudiante.apelliestu,
                     teleestu = estudiante.teleestu,
                     correoestu = estudiante.correoestu)
    db.add(estudiante)
    db.commit()
    db.refresh(estudiante)
    return estudiante

def actualizar_estudiante_completo(ciestu: str, estu_updata: EstuEntrada, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="El estudiante no fue encontrado")

    for key, value in estu_updata.model_dump(exclude_unset=True).items():
        setattr(db_estu, key, value)

    db.commit()
    db.refresh(db_estu)
    return db_estu

def actualizar_estudiante_parcial(ciestu: str, estu_updata: EstudianteActualizar, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo == True).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = estu_updata.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_estu, key, value)

    db.commit()
    db.refresh(db_estu)
    return db_estu

def eliminar_estudiante(ciestu: str, db: Session):
    db_estu = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo==True).first()
    if not db_estu:
        raise HTTPException(status_code=404, detail="Estudiante no encontrado")
    # Aki en lugar de db.delete(db_cliente), hacemos que ese maldito cambie su estado civil a desaperecido
    db_estu.activo = False
    db.commit()
    return None