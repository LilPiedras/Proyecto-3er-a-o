from models.oferta_seccion_model import Oferta_seccion
from Schemas.oferta_seccion_schema import OfertaEntrada, OfertaActualizar
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException

def obtener_oferta_detallada_estudiante(ciestu: str, db: Session):
    """
    Trae la oferta del estudiante con todos los datos anidados
    (Nombre de sección, Salón, Día, Bloque de horario y Carrera).
    """
    ofertas = (
        db.query(Oferta_seccion)
        .options(
            joinedload(Oferta_seccion.carrera_rel),
            joinedload(Oferta_seccion.seccion_rel),
            joinedload(Oferta_seccion.horario_rel)
        )
        .filter(Oferta_seccion.estudiante == ciestu)
        .all()
    )
    
    if not ofertas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="El estudiante no posee una sección o horario asignado actualmente."
        )
        
    return ofertas


# 1. FUNCIÓN PARA EL DIRECTOR (Ve todas las ofertas y registros)
def listar_ofertas(db: Session):
    secmo = db.query(Oferta_seccion).all() # Se quitó el filtro .activo == True porque no existe en el modelo
    if not secmo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sin ofertas inscritas")
    return secmo


# 2. FUNCIÓN DE CREACIÓN / INSCRIPCIÓN 
def crear_oferta(seccmo: OfertaEntrada, db: Session):
    try:
        nueva_oferta = Oferta_seccion(
            idcarremo=seccmo.idcarremo,
            idsecc=seccmo.idsecc,
            estudiante=seccmo.estudiante, # Null si lo crea el director, cédula si se inscribe el estudiante
            horario=seccmo.horario
        )
        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)
        return nueva_oferta
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig)
        if "unq_estudiante_seccion" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="El estudiante ya se encuentra inscrito en esta sección."
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Error de integridad al registrar la oferta/inscripción."
        )


# 3. FUNCIÓN EXCLUSIVA PARA EL ESTUDIANTE (Solo ve sus datos)
def obtener_oferta_estudiante(cedula: str, db: Session):
    """
    Filtra la tabla de ofertas y retorna únicamente los registros
    donde el campo estudiante coincida con la cédula solicitada.
    """
    ofertas = db.query(Oferta_seccion).filter(Oferta_seccion.estudiante == cedula).all()
    
    if not ofertas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="No te encuentras inscrito en ninguna sección."
        )
    return ofertas


# 4. ACTUALIZACIÓN 
def actualizar_oferta_parcial(idseccmo: int, oferta_update: OfertaActualizar, db: Session):
    db_oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not db_oferta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La oferta no fue encontrada")

    update_data = oferta_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_oferta, key, value)

    try:
        db.commit()
        db.refresh(db_oferta)
        return db_oferta
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo actualizar la oferta por violación de restricciones"
        )


# 5. ELIMINACIÓN CORREGIDA
def eliminar_oferta(idseccmo: int, db: Session):
    db_oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not db_oferta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La oferta no fue encontrada")

    # Eliminación física en BD ya que no tienes un campo 'activo' en tu modelo Oferta_seccion
    try:
        db.delete(db_oferta)
        db.commit()
        return None
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="No se puede eliminar la oferta porque está en uso")