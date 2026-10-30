import calendar
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from models.mensualidad_model import Mensualidad
from models.mensualidad_estu_model import Mensualidad_estu
from models.estudiante_model import Estudiante
from models.periodo_model import Periodo
from Schemas.mensualidad_schema import MensualidadActualizar, MensualidadEntrada
from sqlalchemy.orm import Session


def obtener_mensualidad_por_id(idmensualidad: int, db: Session):
    mensualidad = db.query(Mensualidad).filter(
        Mensualidad.idmensualidad == idmensualidad,
        Mensualidad.activo == True,
    ).first()
    if mensualidad is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La mensualidad no fue encontrada")
    return mensualidad


def listar_mensualidades(db: Session):
    return db.query(Mensualidad).filter(Mensualidad.activo == True).all()


def _estado_pago(estado: str) -> str:
    return "pagado" if estado in {"pagado", "completado"} else estado


def _validar_datos_pago(factura: str | None, fechapago: date | None) -> None:
    if not factura or not factura.strip() or fechapago is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Para registrar un pago indique la referencia del comprobante y la fecha del pago.",
        )


def crear_mensualidad(mensualidad: MensualidadEntrada, encargado: str, db: Session):
    periodo = db.query(Periodo).filter(
        Periodo.id == mensualidad.periodo_id,
        Periodo.activo == True,
    ).first()
    if periodo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El período académico no existe o está inactivo")

    estudiante = db.query(Estudiante).filter(
        Estudiante.ciestu == mensualidad.estudiante,
        Estudiante.activo == True,
    ).first()
    if estudiante is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El estudiante no existe o está inactivo")

    estado = _estado_pago(mensualidad.estado)
    if estado == "pagado":
        _validar_datos_pago(mensualidad.factura, mensualidad.fechapago)

    nueva_mensualidad = Mensualidad(
        metodopago=mensualidad.metodopago,
        monedapago=mensualidad.monedapago,
        monto=mensualidad.monto,
        encargado=encargado,
        verificacion=mensualidad.verificacion,
        periodo_id=periodo.id,
        fecha_corte=mensualidad.fecha_corte,
        estado=estado,
        activo=True,
    )
    nueva_mensualidad.estudiantes_asignados.append(Mensualidad_estu(
        estudiante=estudiante.ciestu,
        fecha_vencimiento=mensualidad.fecha_corte,
        factura=mensualidad.factura.strip() if mensualidad.factura else None,
        fechapago=mensualidad.fechapago,
        periodo_id=periodo.id,
        estado=estado,
        activo=True,
    ))
    db.add(nueva_mensualidad)
    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo registrar el pago. Verifique que la referencia del comprobante no esté repetida.",
        ) from error
    db.refresh(nueva_mensualidad)
    return nueva_mensualidad


def actualizar_mensualidad_parcial(idmensualidad: int, men_update: MensualidadActualizar, db: Session):
    mensualidad = db.query(Mensualidad).filter(
        Mensualidad.idmensualidad == idmensualidad,
        Mensualidad.activo == True,
    ).first()
    if mensualidad is None:
        raise HTTPException(status_code=404, detail="La mensualidad no fue encontrada")

    update_data = men_update.model_dump(exclude_unset=True)
    if "periodo_id" in update_data:
        periodo = db.query(Periodo).filter(
            Periodo.id == update_data["periodo_id"],
            Periodo.activo == True,
        ).first()
        if periodo is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="El período académico no existe o está inactivo")

    estado = _estado_pago(update_data.get("estado") or mensualidad.estado)
    if estado == "pagado":
        asignacion = mensualidad.estudiantes_asignados[0] if mensualidad.estudiantes_asignados else None
        factura = update_data.get("factura")
        fechapago = update_data.get("fechapago")
        _validar_datos_pago(
            factura if factura is not None else (asignacion.factura if asignacion else None),
            fechapago if fechapago is not None else (asignacion.fechapago if asignacion else None),
        )

    update_data["estado"] = estado
    for key, value in update_data.items():
        if key not in {"factura", "fechapago"}:
            setattr(mensualidad, key, value)
        for asignacion in mensualidad.estudiantes_asignados:
            if key == "periodo_id":
                asignacion.periodo_id = value
            elif key == "fecha_corte":
                asignacion.fecha_vencimiento = value
            elif key == "estado":
                asignacion.estado = value
            elif key == "factura":
                asignacion.factura = value.strip() if value else None
            elif key == "fechapago":
                asignacion.fechapago = value

    try:
        db.commit()
    except IntegrityError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No se pudo actualizar el pago. Verifique que la referencia del comprobante no esté repetida.",
        ) from error
    db.refresh(mensualidad)
    return mensualidad


def eliminar_mensualidad(idmensualidad: int, db: Session):
    mensualidad = obtener_mensualidad_por_id(idmensualidad, db)
    mensualidad.activo = False
    db.commit()


def marcar_pagos_vencidos(db: Session, hoy: date | None = None) -> int:
    hoy = hoy or date.today()
    mes_anterior = hoy.month - 1 or 12
    anio_mes_anterior = hoy.year - (1 if hoy.month == 1 else 0)
    limite_vencimiento = date(
        anio_mes_anterior,
        mes_anterior,
        min(hoy.day, calendar.monthrange(anio_mes_anterior, mes_anterior)[1]),
    )
    resultado = db.execute(
        update(Mensualidad_estu)
        .where(
            Mensualidad_estu.estado == "pendiente",
            Mensualidad_estu.fecha_vencimiento <= limite_vencimiento,
            Mensualidad_estu.activo == True,
        )
        .values(estado="vencido")
    )
    db.commit()
    if resultado.rowcount is None:
        raise RuntimeError("La base de datos no informó cuántos pagos se actualizaron")
    return resultado.rowcount
