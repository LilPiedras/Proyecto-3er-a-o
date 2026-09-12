from models.notas_model import *
from Schemas.notas_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_notas_por_id(idnota: int, db: Session):
    nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo == True).first()
    if nota is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La nota no fue encontrada")
    return nota

def listar_notas(db: Session):
    nota = db.query(Notas).filter(Notas.activo == True).all()
    if not nota:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de notas vacía")
    return nota

def crear_nota(nota: NotasEntrada, db: Session):
    nueva_nota = Notas(
        oferta=nota.oferta,
        notas=nota.notas,
        fechanota=nota.fechanota
    )
    db.add(nueva_nota)
    db.commit()
    db.refresh(nueva_nota)
    return nueva_nota

def actualizar_nota_completo(idnota: int, nota_up: NotaActualizar, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota).first()
    if not db_nota:
        raise HTTPException(status_code=404, detail="La nota no fue encontrada")

    for key, value in nota_up.model_dump(exclude_unset=True).items():
        setattr(db_nota, key, value)

    db.commit()
    db.refresh(db_nota)
    return db_nota

def actualizar_nota_parcial(idnota: int, nota_up: NotaActualizar, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo == True).first()
    if not db_nota:
        # Corregido: Decía "Curso no encontrado"
        raise HTTPException(status_code=404, detail="La nota no fue encontrada")

    update_data = nota_up.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_nota, key, value)

    db.commit()
    db.refresh(db_nota)
    return db_nota

def eliminar_nota(idnota: int, db: Session):
    db_nota = db.query(Notas).filter(Notas.idnota == idnota, Notas.activo == True).first()
    if not db_nota:
        raise HTTPException(status_code=404, detail="La nota no fue encontrada")

    db_nota.activo = False
    db.commit()
    return None