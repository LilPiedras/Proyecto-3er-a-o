from models.asignacion_docente_model import Asignacion_Docente
from models.materias_model import Materias
from models.seccion_model import Seccion
from Schemas.asignacion_docente_schema import (
    AsigmentDocEntrada,
    AsigmentDocUpdate,
)
from sqlalchemy.orm import Session
from fastapi import status, HTTPException

def obtener_asignacion_de_materia_por_id(id_asignacion_docente: int, db: Session):
    asig = (
        db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente, Asignacion_Docente.activo.is_(True)).first())
    if asig is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="La asignación del docente no fue encontrada",
        )
    return asig

def listar_docentes_asignados(db: Session):
    return (db.query(Asignacion_Docente).filter(Asignacion_Docente.activo.is_(True)).all())

def crear_nueva_asignacion(asig: AsigmentDocEntrada, db: Session):
    existe = (
        db.query(Asignacion_Docente).filter(Asignacion_Docente.empleado_id == asig.empleado_id, Asignacion_Docente.materia_id == asig.materia_id, Asignacion_Docente.seccion_id == asig.seccion_id, Asignacion_Docente.activo.is_(True)).first())
    if existe:
        raise HTTPException(
            status_code=400,
            detail="Ya existe una asignación activa para ese docente + materia + sección",
        )

    nueva = Asignacion_Docente(
        empleado_id=asig.empleado_id,
        materia_id=asig.materia_id,
        seccion_id=asig.seccion_id,
        fecha_asignacion=str(asig.fecha_asignacion),
        horario_id=asig.horario_id,
        activo=True,
    )
    db.add(nueva)
    db.commit()
    db.refresh(nueva)

    materia = db.query(Materias).filter(Materias.idmateria == asig.materia_id).first()
    if materia:
        materia.docente = asig.empleado_id
        db.commit()

    return nueva

def actualizar_asignaciones_completo(
    id_asignacion_docente: int, data: AsigmentDocEntrada, db: Session):
    db_si = (db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente).first())
    if not db_si:
        raise HTTPException(status_code=404, detail="La asignación no existe")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(db_si, key, value)

    db.commit()
    db.refresh(db_si)
    return db_si

def actualizar_horario_parcial(id_asignacion_docente: int, data: AsigmentDocUpdate, db: Session):
    db_toy = (db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente).first())
    if not db_toy:
        raise HTTPException(status_code=404, detail="La asignación no fue encontrada")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(db_toy, key, value)

    db.commit()
    db.refresh(db_toy)
    return db_toy

def eliminar_asig(id_asignacion_docente: int, db: Session):
    db_si = (
        db.query(Asignacion_Docente).filter(Asignacion_Docente.id_asignacion_docente == id_asignacion_docente, Asignacion_Docente.activo.is_(True)).first())
    if not db_si:
        raise HTTPException(status_code=404, detail="La asignación no fue encontrada")

    db_si.activo = False
    db.commit()
    return None

def listar_asignaciones_por_docente(ci_docente: str, db: Session):
    filas = (db.query(Asignacion_Docente, Materias.nombremateria, Seccion.nomsecc)
             .join(Materias, Asignacion_Docente.materia_id == Materias.idmateria)
             .join(Seccion, Asignacion_Docente.seccion_id == Seccion.idsecc).filter(Asignacion_Docente.empleado_id == ci_docente, Asignacion_Docente.activo.is_(True)).all())

    resultado = []
    for asig, nombremateria, nomsecc in filas:
        resultado.append(
            {
                "id_asignacion_docente": asig.id_asignacion_docente,
                "empleado_id": asig.empleado_id,
                "materia_id": asig.materia_id,
                "nombremateria": nombremateria,
                "seccion_id": asig.seccion_id,
                "nomsecc": nomsecc,
                "horario_id": asig.horario_id,
                "fecha_asignacion": asig.fecha_asignacion,
            }
        )
    return resultado