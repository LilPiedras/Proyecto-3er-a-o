from models.rol_model import *
from Schemas.roles_schema import *
from sqlalchemy.orm import Session
from fastapi import status, HTTPException


def listar_roles(db: Session):
    roles = db.query(Rol).filter(Rol.activo == True).all()
    if not roles:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lista de Roles vacia")
    return roles

def crear_roles(roles: RolEntrada, db:Session):
    roles = Rol(nombrerol = roles.nombrerol,
                     descripcion = roles.descripcion)
    db.add(roles)
    db.commit()
    db.refresh(roles)
    return roles

def actualizar_roles_parcial(idrol: int, rolcito: Rolactualizar, db: Session):
    db_rol = db.query(Rol).filter(Rol.idrol == idrol).first()
    if not db_rol:
        raise HTTPException(status_code=404, detail="Rol no encontrado")

    update_data = rolcito.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_rol, key, value)

    db.commit()
    db.refresh(db_rol)
    return db_rol


def eliminar_rol(idrol: int, db: Session):
    db_nota = db.query(Rol).filter(Rol.idrol == idrol, Rol.activo==True).first()
    if not db_nota:
        raise HTTPException(status_code=404, detail="la nota no fue encontrada")

    db_nota.activo = False
    db.commit()
    return None