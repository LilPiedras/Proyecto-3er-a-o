from models.carrera_model import Carrera
from Schemas.carrera_schema import CarreraEntrada, CarreraUpdata
from sqlalchemy.orm import Session
from fastapi import status, HTTPException
from sqlalchemy import func

def obtener_carrera_por_id(idcarrera: int, db: Session):
    carri = db.query(Carrera).filter(Carrera.idcarrera == idcarrera, Carrera.activo == True).first()
    if carri is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La carrera no fue encontrada")
    return carri

def listar_carrera(db: Session):
    carri = db.query(Carrera).filter(Carrera.activo == True).all()
    return carri

def crear_carrera(carri: CarreraEntrada, db: Session):
    nombre = carri.nombrecarrera.strip()
    existe = db.query(Carrera).filter(
        func.lower(func.trim(Carrera.nombrecarrera)) == nombre.lower(),
        Carrera.activo == True
    ).first()
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ya existe una carrera con el nombre '{nombre}'"
        )

    nueva_carrera = Carrera(
        nombrecarrera=nombre,
        descripcion=carri.descripcion.strip(),
        precio_usd=carri.precio_usd,
    )
    db.add(nueva_carrera)
    db.commit()
    db.refresh(nueva_carrera)
    return nueva_carrera

def actualizar_carrera_parcial(idcarrera: int, carrera_update: CarreraUpdata, db: Session):
    db_car = db.query(Carrera).filter(Carrera.idcarrera == idcarrera, Carrera.activo == True).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="Carrera no encontrada")

    update_data = carrera_update.model_dump(exclude_unset=True)

    if "nombrecarrera" in update_data and update_data["nombrecarrera"]:
        nombre = update_data["nombrecarrera"].strip()
        existe = db.query(Carrera).filter(
            func.lower(func.trim(Carrera.nombrecarrera)) == nombre.lower(),
            Carrera.activo == True,
            Carrera.idcarrera != idcarrera
        ).first()
        if existe:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe una carrera con el nombre '{nombre}'"
            )
        update_data["nombrecarrera"] = nombre

    for key, value in update_data.items():
        setattr(db_car, key, value)

    db.commit()
    db.refresh(db_car)
    return db_car

def eliminar_carrera(idcarrera: int, db: Session):
    db_car = db.query(Carrera).filter(Carrera.idcarrera == idcarrera, Carrera.activo == True).first()
    if not db_car:
        raise HTTPException(status_code=404, detail="La carrera no fue encontrada o no existe")

    db_car.activo = False
    db.commit()
    return None