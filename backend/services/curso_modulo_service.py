from models.curso_modulo_model import *
from Schemas.curso_modulo_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_curso_modulo_por_id(idcurso_modulo:int, db:Session):
    cur_mod = db.query(CursoModulo).filter(CursoModulo.idcurso_modulo == idcurso_modulo, CursoModulo.activo == True).first()
    if cur_mod is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empleado no Encontrado")
    return cur_mod

def listar_curso_modulos(db: Session):
    cur_mod = db.query(CursoModulo).filter(CursoModulo.activo == True).all()
    if not cur_mod:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de empleado vacia")
    return cur_mod

def crear_curso_modulololo(cur_mod: CursoModuloEntrada, db:Session):
    cur_mod= CursoModulo(idcurso_modulo = cur_mod.idcurso_modulo,
                     curso = cur_mod.curso,
                     modulo = cur_mod.modulo,
                     notas = cur_mod.notas)
    db.add(cur_mod)
    db.commit()
    db.refresh(cur_mod)
    return cur_mod

def actualizar_culomodular_completo(idcurso_modulo: int, cur_updata: CursoModuloEntrada, db: Session):
    db_curm = db.query(CursoModulo).filter(CursoModulo.idcurso_modulo == idcurso_modulo).first()
    if not db_curm:
        raise HTTPException(status_code=404, detail="Curso no encontrado")

    for key, value in cur_updata.model_dump(exclude_unset=True).items():
        setattr(db_curm, key, value)

    db.commit()
    db.refresh(db_curm)
    return db_curm

def actualizar_cursor_parcial(idcurso_modulo: int, cursomo_updata: CursoModuloActualizar, db: Session):
    db_mo = db.query(CursoModulo).filter(CursoModulo.idcurso_modulo == idcurso_modulo, CursoModulo.activo == True).first()
    if not db_mo:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")

    update_data = cursomo_updata.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_mo, key, value)

    db.commit()
    db.refresh(db_mo)
    return db_mo

def eliminar_curso_modulo(idcurso_modulo: int, db: Session):
    db_curmi = db.query(CursoModulo).filter(CursoModulo.idcurso_modulo == idcurso_modulo, CursoModulo.activo==True).first()
    if not db_curmi:
        raise HTTPException(status_code=404, detail="Empleado no encontrado")
    # Aki en lugar de db.delete(db_cliente), hacemos que ese maldito cambie su estado civil a desaperecido
    db_curmi.activo = False
    db.commit()
    return None