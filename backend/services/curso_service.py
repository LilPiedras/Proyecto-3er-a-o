from models.curso_model import *
from Schemas.curso_schema import CursoEntrada, CursoActualizar
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_curso_por_id(idcurso:int, db:Session):
    curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo == True).first()
    if curso is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El curso no fue encontrado")
    return curso

def listar_curso(db: Session):
    curso = db.query(Curso).filter(Curso.activo == True).all()
    if not curso:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de cursos vacia")
    return curso

def crear_curso(curso: CursoEntrada, db:Session):
    curso = Curso(nomcurso = curso.nomcurso,
                     preciocurso = curso.preciocurso,
                     nivelcur= curso.nivelcur,
                     docenasig = curso.docenasig
                    )
    db.add(curso)
    db.commit()
    db.refresh(curso)
    return curso

def actualizar_curso_completo(idcurso: int, curso_updata: CursoActualizar, db: Session):
    db_curso = db.query(Curso).filter(Curso.idcurso == idcurso).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="curso no encontrado")

    for key, value in curso_updata.model_dump(exclude_unset=True).items():
        setattr(db_curso, key, value)

    db.commit()
    db.refresh(db_curso)
    return db_curso

def actualizar_curso_parcial(idcurso: int, curso_update: CursoActualizar, db: Session):
    db_curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo == True).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    update_data = curso_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_curso, key, value)

    db.commit()
    db.refresh(db_curso)
    return db_curso

def eliminar_curso(idcurso: int, db: Session):
    db_curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo==True).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="El curso no fue encontrado")

    db_curso.activo = False
    db.commit()
    return None