from models.mensualidad_model import Mensualidad
from models.mensualidad_estu_model import Mensualidad_estu
from models.estudiante_model import Estudiante
from Schemas.mensualidad_schema import MensualidadActualizar, MensualidadEntrada
from sqlalchemy.orm import Session
from fastapi import status, HTTPException


def obtener_mensualidad_por_id(idmensualidad: int, db: Session):
    mensualidad = db.query(Mensualidad).filter(
        Mensualidad.idmensualidad == idmensualidad,
        Mensualidad.activo == True,
    ).first()
    if mensualidad is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mensualidad no fue encontrada")
    return mensualidad


def listar_mensualidades(db: Session):
    return db.query(Mensualidad).filter(Mensualidad.activo == True).all()


def crear_mensualidad(mensualidad: MensualidadEntrada, encargado: str, db: Session):
    estudiante = db.query(Estudiante).filter(
        Estudiante.ciestu == mensualidad.estudiante,
        Estudiante.activo == True,
    ).first()
    if estudiante is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no existe o está inactivo")

    nueva_mensualidad = Mensualidad(
        metodopago=mensualidad.metodopago,
        monedapago=mensualidad.monedapago,
        monto=mensualidad.monto,
        encargado=encargado,
        verificacion=mensualidad.verificacion,
        periodo=mensualidad.periodo,
        fecha_corte=mensualidad.fecha_corte,
        estado=mensualidad.estado,
        activo=True,
    )
    nueva_mensualidad.estudiantes_asignados.append(Mensualidad_estu(
        estudiante=estudiante.ciestu,
        fecha_vencimiento=mensualidad.fecha_corte,
        periodo=mensualidad.periodo,
        estado=mensualidad.estado,
        activo=True,
    ))
    db.add(nueva_mensualidad)
    db.commit()
    db.refresh(nueva_mensualidad)
    return nueva_mensualidad


def actualizar_mensualidad_parcial(idmensualidad: int, men_update: MensualidadActualizar, db: Session):
    mensualidad = db.query(Mensualidad).filter(
        Mensualidad.idmensualidad == idmensualidad,
        Mensualidad.activo == True,
    ).first()
    if mensualidad is None:
        raise HTTPException(status_code=404, detail="La mensualidad no fue encontrada")

    update_data = men_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(mensualidad, key, value)

    db.commit()
    db.refresh(mensualidad)
    return mensualidad


def eliminar_mensualidad(idmensualidad: int, db: Session):
    mensualidad = obtener_mensualidad_por_id(idmensualidad, db)
    mensualidad.activo = False
    db.commit()
