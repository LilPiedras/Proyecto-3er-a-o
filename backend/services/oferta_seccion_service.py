from models.oferta_seccion_model import Oferta_seccion
from Schemas.oferta_seccion_schema import OfertaEntrada, OfertaActualizar
from models.estudiante_model import Estudiante
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

def crear_oferta(seccmo: OfertaEntrada, db: Session):
    try:
        nueva_oferta = Oferta_seccion(
            idcarrera=seccmo.idcarrera,
            idsecc=seccmo.idsecc,
            estudiante=seccmo.estudiante,
            horario=seccmo.horario,
            idcarremo=seccmo.idcarremo
        )
        db.add(nueva_oferta)
        db.commit()
        db.refresh(nueva_oferta)
        return nueva_oferta
    except IntegrityError as e:
        db.rollback()
        error_msg = str(e.orig).lower()

        if "foreign key" in error_msg or "violates foreign key constraint" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Error de clave foránea: revisa que existan idcarrera, idsecc, horario, estudiante o idcarremo."
            )
        if "unique" in error_msg or "duplicate" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Ya existe un registro igual."
            )
        if "not-null" in error_msg or "null value" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Falta un campo obligatorio."
            )

        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error de integridad: {str(e.orig)}"
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

def asignar_estudiante_a_oferta(idseccmo: int, ciestu: str, db: Session):
    oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta académica no existe")

    estudiante = db.query(Estudiante).filter(Estudiante.ciestu == ciestu, Estudiante.activo.is_(True)).first()
    if not estudiante:
        raise HTTPException(status_code=404, detail="El estudiante no existe o está inactivo")

    if oferta.estudiante is not None:
        raise HTTPException(
            status_code=409,
            detail=f"Esta oferta ya tiene asignado al estudiante {oferta.estudiante}"
        )

    oferta.estudiante = ciestu
    db.commit()
    db.refresh(oferta)
    return oferta

def desasignar_estudiante(idseccmo: int, db: Session):
    oferta = db.query(Oferta_seccion).filter(Oferta_seccion.idseccmo == idseccmo).first()
    if not oferta:
        raise HTTPException(status_code=404, detail="La oferta no existe")

    if oferta.estudiante is None:
        raise HTTPException(status_code=400, detail="Esta oferta no tiene estudiante asignado")

    oferta.estudiante = None
    db.commit()
    db.refresh(oferta)
    return oferta

def inscribir_estudiante_en_seccion(ciestu: str, idsecc: int, db: Session):
    ofertas = db.query(Oferta_seccion).filter(Oferta_seccion.idsecc == idsecc).all()
    for oferta in ofertas:
        oferta.estudiante = ciestu
    db.commit()
    return {"mensaje": "Estudiante inscrito en las materias de la sección exitosamente"}