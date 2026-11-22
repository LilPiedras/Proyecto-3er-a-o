from sqlalchemy import func
from sqlalchemy.orm import Session

from models.estudiante_model import Estudiante
from models.empleado_model import Empleado
from models.modulo_model import Modulo
from models.mensualidad_model import Mensualidad
from Schemas.dashboard_schema import *


def _extraer_idrol(usuario_o_rol) -> int:
    if isinstance(usuario_o_rol, int):
        return usuario_o_rol

    if isinstance(usuario_o_rol, dict):
        if usuario_o_rol.get("idrol") is not None:
            return int(usuario_o_rol["idrol"])

    idrol_directo = getattr(usuario_o_rol, "idrol", None)
    if idrol_directo is not None:
        return int(idrol_directo)

    logins = getattr(usuario_o_rol, "logins", None)
    if logins:
        login_activo = next((l for l in logins if getattr(l, "activo", True)), None)
        target_login = login_activo or logins[-1]
        if getattr(target_login, "idrol", None) is not None:
            return int(target_login.idrol)

    raise ValueError("No se pudo obtener un idrol válido para el dashboard")

def obtener_resumen_dashboard(db: Session, usuario_o_rol) -> DashboardResumenResponse:
    idrol = _extraer_idrol(usuario_o_rol)

    total_estudiantes = (
        db.query(func.count())
        .select_from(Estudiante)
        .filter(getattr(Estudiante, "activo", True) == True)
        .scalar()
        or 0
    )

    total_docentes = (
        db.query(func.count())
        .select_from(Empleado)
        .filter(getattr(Empleado, "activo", True) == True)
        .scalar()
        or 0
    )

    total_modulos = (
        db.query(func.count())
        .select_from(Modulo)
        .filter(getattr(Modulo, "activo", True) == True)
        .scalar()
        or 0
    )

    modulos_rows = (
        db.query(Modulo)
        .filter(getattr(Modulo, "activo", True) == True)
        .limit(8)
        .all()
    )
    estudiantes_por_modulo = [
        ModuloConteo(
            modulo=getattr(m, "nombremodulo", None) or getattr(m, "nombre", "Módulo"),
            cantidad=getattr(m, "cupos_ocupados", 0) or 0,
        )
        for m in modulos_rows
    ]

    resumen_mensualidades = None
    if idrol in (1, 2):
        total_reg = db.query(func.count()).select_from(Mensualidad).scalar() or 0

        campo_estado = getattr(Mensualidad, "estado", None) or getattr(Mensualidad, "estatus", None)
        pagados = 0
        pendientes = 0

        if campo_estado is not None:
            pagados = (
                db.query(func.count())
                .select_from(Mensualidad)
                .filter(func.lower(campo_estado).in_(["pagado", "pagada", "solvente", "aprobado"]))
                .scalar()
                or 0
            )
            pendientes = (
                db.query(func.count())
                .select_from(Mensualidad)
                .filter(func.lower(campo_estado).in_(["pendiente", "vencido", "vencida", "mora"]))
                .scalar()
                or 0
            )

        campo_monto = (
            getattr(Mensualidad, "monto", None)
            or getattr(Mensualidad, "montopago", None)
            or getattr(Mensualidad, "total", None)
        )
        monto_recaudado = 0.0
        if campo_monto is not None:
            if campo_estado is not None:
                monto_recaudado = float(
                    db.query(func.coalesce(func.sum(campo_monto), 0))
                    .filter(func.lower(campo_estado).in_(["pagado", "pagada", "solvente", "aprobado"]))
                    .scalar()
                    or 0
                )
            else:
                monto_recaudado = float(
                    db.query(func.coalesce(func.sum(campo_monto), 0)).scalar() or 0
                )

        resumen_mensualidades = ResumenMensualidades(
            total_registros=total_reg,
            pagados=pagados,
            pendientes=pendientes,
            monto_recaudado=round(monto_recaudado, 2),
        )

    return DashboardResumenResponse(
        rol=idrol,
        total_estudiantes=total_estudiantes,
        total_docentes=total_docentes,
        total_modulos=total_modulos,
        estudiantes_por_modulo=estudiantes_por_modulo,
        mensualidades=resumen_mensualidades,
    )