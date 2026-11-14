from models.curso_model import Curso
from models.empleado_model import Empleado
from Schemas.curso_schema import CursoEntrada, CursoActualizar
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import status, HTTPException

def obtener_curso_por_id(idcurso: int, db: Session):
    curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo == True).first()
    if curso is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El curso no fue encontrado")
    return curso

def listar_curso(db: Session):
    cursos = db.query(Curso).filter(Curso.activo == True).all()
    if not cursos:
        return [] 
    return cursos

def crear_curso(curso_in: CursoEntrada, db: Session):
    if curso_in.docenasig:
        profesor = db.query(Empleado).filter(
            Empleado.ciempleado == curso_in.docenasig,
            Empleado.activo.is_(True),
        ).first()
        if profesor is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El profesor seleccionado no existe o está inactivo. Actualiza la lista de profesores e inténtalo de nuevo.",
            )

    nuevo_curso = Curso(
        nomcurso=curso_in.nomcurso,
        preciocurso=curso_in.preciocurso,
        nivelcur=curso_in.nivelcur,
        docenasig=curso_in.docenasig,
        activo=True 
    )
    db.add(nuevo_curso)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo registrar el curso porque un dato relacionado dejó de estar disponible. Actualiza la lista e inténtalo de nuevo.",
        ) from error
    db.refresh(nuevo_curso)
    return nuevo_curso

def actualizar_curso_completo(idcurso: int, curso_update: CursoActualizar, db: Session):
    db_curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo == True).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="El curso no fue encontrado")

    update_data = curso_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_curso, key, value)

    db.commit()
    db.refresh(db_curso)
    return db_curso

def eliminar_curso(idcurso: int, db: Session):
    db_curso = db.query(Curso).filter(Curso.idcurso == idcurso, Curso.activo == True).first()
    if not db_curso:
        raise HTTPException(status_code=404, detail="El curso no fue encontrado")

    db_curso.activo = False 
    db.commit()
    return None