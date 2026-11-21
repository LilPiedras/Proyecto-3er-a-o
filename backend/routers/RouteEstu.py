from typing import List

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from database.connection import SessionLocal
from models.estudiante_model import *
from models.usuario_model import Usuario
from Schemas.estudiante_schema import EstuEntrada, EstudianteSalida, EstudianteActualizar
from services import estudiante_service
from tokensitos.auth_depencias import VerificarRoles
from fastapi import HTTPException, Query, Response

estudiante_router = APIRouter(
    prefix="/estudiantes",
    tags=["Estudiantes"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Rutas fijas ANTES de /{ciestu}
@estudiante_router.get("/inactivos", response_model=List[EstudianteSalida], status_code=status.HTTP_200_OK)
def listar_estudiantes_inactivos(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2])),
):
    return estudiante_service.listar_estudiantes_inactivos(db)


@estudiante_router.get("/excel", status_code=status.HTTP_200_OK)
def exportar_nomina_estudiantes(
    incluir_inactivos: bool = Query(default=False),
    idmateria: int | None = Query(default=None),
    idsecc: int | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2, 3, 4])),
):
    if int(getattr(current_user, "idrol", 0) or 0) == 4:
        if not idmateria or not idsecc:
            raise HTTPException(
                status_code=422,
                detail="El docente debe indicar idmateria e idsecc",
            )
        excel_bytes = estudiante_service.exportar_nomina_por_materia_seccion(
            db,
            idmateria=idmateria,
            idsecc=idsecc,
            ci_docente=current_user.ciuser,
        )
    elif idmateria and idsecc:
        # Admin/coord también pueden filtrar
        excel_bytes = estudiante_service.exportar_nomina_por_materia_seccion(
            db,
            idmateria=idmateria,
            idsecc=idsecc,
            ci_docente=None,
        )
    else:
        excel_bytes = estudiante_service.exportar_nomina_excel(
            db, incluir_inactivos=incluir_inactivos
        )

    return Response(
        content=excel_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": 'attachment; filename="nomina_estudiantes.xlsx"'},
    )


@estudiante_router.get("/{ciestu}", response_model=EstudianteSalida)
def obtener_estudiante(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([4, 3, 2, 1])),
):
    return estudiante_service.obtener_estudiante_por_id(ciestu, db)


@estudiante_router.get("/", response_model=List[EstudianteSalida], status_code=status.HTTP_200_OK)
def listar_estudiantes(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([5, 4, 3, 2, 1])),
):
    return estudiante_service.listar_estudiantes(db)


@estudiante_router.post("/", response_model=EstuEntrada, status_code=status.HTTP_200_OK)
def crear_estudiante(
    estudiante: EstuEntrada,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1])),
):
    return estudiante_service.crear_estudiante(estudiante, current_user.ciuser, db)


@estudiante_router.put("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_completo(
    ciestu: str,
    estu_updata: EstudianteActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1])),
):
    return estudiante_service.actualizar_estudiante_completo(ciestu, estu_updata, current_user.ciuser, db)


@estudiante_router.patch("/{ciestu}", response_model=EstudianteSalida)
def update_estudiante_parcial(
    ciestu: str,
    estu_updata: EstudianteActualizar,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([3, 2, 1])),
):
    return estudiante_service.actualizar_estudiante_parcial(ciestu, estu_updata, current_user.ciuser, db)


@estudiante_router.patch("/{ciestu}/restaurar", response_model=EstudianteSalida)
def restaurar_estudiante_logico(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2])),
):
    return estudiante_service.restaurar_estudiante(ciestu, current_user.ciuser, db)


@estudiante_router.delete("/{ciestu}", status_code=status.HTTP_204_NO_CONTENT)
def delete_estudiante_logico(
    ciestu: str,
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(VerificarRoles([1, 2])),
):
    return estudiante_service.eliminar_estudiante(ciestu, current_user.ciuser, db)