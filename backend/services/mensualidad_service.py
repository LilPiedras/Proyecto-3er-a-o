import calendar
from datetime import date
from decimal import Decimal, ROUND_HALF_UP

from fastapi import HTTPException, status
from sqlalchemy import update
from sqlalchemy.exc import IntegrityError
from models.mensualidad_model import Mensualidad
from models.mensualidad_estu_model import Mensualidad_estu
from models.estudiante_model import Estudiante
from models.periodo_model import Periodo
from models.carrera_model import Carrera
from models.oferta_seccion_model import Oferta_seccion
from Schemas.mensualidad_schema import MensualidadActualizar, MensualidadEntrada
from sqlalchemy.orm import Session

CENTAVOS = Decimal("0.01")
PRECISION_TASA = Decimal("0.000001")


def obtener_cotizacion_carreras(estudiante: str, periodo_id: int, db: Session) -> dict:
    carreras = (
        db.query(Carrera)
        .join(Oferta_seccion, Oferta_seccion.idcarrera == Carrera.idcarrera)
        .filter(
            Oferta_seccion.estudiante == estudiante,
            Carrera.activo.is_(True),
        )
        .distinct()
        .order_by(Carrera.nombrecarrera)
        .all()
    )
    if not carreras:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="El estudiante no está asignado a ninguna carrera activa.",
        )

    sin_precio = [carrera.nombrecarrera for carrera in carreras if carrera.precio_usd <= 0]
    if sin_precio:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Asigna un precio en dólares mayor que cero a estas carreras: {', '.join(sin_precio)}.",
        )

    monto_base_usd = sum((carrera.precio_usd for carrera in carreras), Decimal("0.00"))
    return {
        "estudiante": estudiante,
        "periodo_id": periodo_id,
        "carreras": [
            {
                "idcarrera": carrera.idcarrera,
                "nombrecarrera": carrera.nombrecarrera,
                "precio_usd": carrera.precio_usd,
            }
            for carrera in carreras
        ],
        "monto_carreras_usd": monto_base_usd,
    }


def _calcular_monto_total(monto_base_usd: Decimal, tasa_conversion: Decimal, monto_extra: Decimal) -> Decimal:
    return (monto_base_usd * tasa_conversion + monto_extra).quantize(
        CENTAVOS,
        rounding=ROUND_HALF_UP,
    )


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


def obtener_estado_mensualidad_reciente(estudiante: str, db: Session):
    return (
        db.query(Mensualidad_estu)
        .join(Mensualidad, Mensualidad.idmensualidad == Mensualidad_estu.idmensualidad)
        .filter(
            Mensualidad_estu.estudiante == estudiante,
            Mensualidad_estu.activo == True,
            Mensualidad.activo == True,
        )
        .order_by(
            Mensualidad.fecha_creacion.desc(),
            Mensualidad.idmensualidad.desc(),
            Mensualidad_estu.idmensualidad_estu.desc(),
        )
        .first()
    )


def _estado_pago(estado: str) -> str:
    return "pagado" if estado in {"pagado", "completado"} else estado


def _validar_datos_pago(factura: str | None, fechapago: date | None) -> None:
    if not factura or not factura.strip() or fechapago is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
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

    cotizacion = obtener_cotizacion_carreras(estudiante.ciestu, periodo.id, db)
    tasa_conversion = mensualidad.tasa_conversion.quantize(
        PRECISION_TASA,
        rounding=ROUND_HALF_UP,
    )
    monto_extra = mensualidad.monto_extra
    if mensualidad.monto is not None and "monto_extra" not in mensualidad.model_fields_set:
        monto_extra = (
            mensualidad.monto - cotizacion["monto_carreras_usd"] * tasa_conversion
        ).quantize(CENTAVOS, rounding=ROUND_HALF_UP)
        if monto_extra < 0:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El monto no puede ser menor al costo de las carreras del estudiante.",
            )
    monto_extra = monto_extra.quantize(CENTAVOS, rounding=ROUND_HALF_UP)
    monto_total = _calcular_monto_total(
        cotizacion["monto_carreras_usd"],
        tasa_conversion,
        monto_extra,
    )
    if mensualidad.monto is not None and "monto_extra" in mensualidad.model_fields_set:
        if mensualidad.monto.quantize(CENTAVOS) != monto_total:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail="El monto enviado no coincide con carreras más extra a la tasa indicada.",
            )

    nueva_mensualidad = Mensualidad(
        metodopago=mensualidad.metodopago,
        monedapago=mensualidad.monedapago,
        monto=monto_total,
        monto_carreras_usd=cotizacion["monto_carreras_usd"],
        monto_extra=monto_extra,
        tasa_conversion=tasa_conversion,
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
    asignacion = mensualidad.estudiantes_asignados[0] if mensualidad.estudiantes_asignados else None
    cambio_precio = bool(
        {"monto", "monto_extra", "tasa_conversion", "periodo_id"} & update_data.keys()
    )
    if cambio_precio:
        if asignacion is None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="La mensualidad no tiene un estudiante asociado para recalcular su precio.",
            )
        periodo_id = update_data.get("periodo_id", mensualidad.periodo_id)
        cotizacion = obtener_cotizacion_carreras(asignacion.estudiante, periodo_id, db)
        tasa_conversion = update_data.get("tasa_conversion", mensualidad.tasa_conversion).quantize(
            PRECISION_TASA,
            rounding=ROUND_HALF_UP,
        )
        monto_extra = update_data.get("monto_extra", mensualidad.monto_extra)
        if "monto" in update_data and "monto_extra" not in update_data:
            monto_extra = (
                update_data["monto"] - cotizacion["monto_carreras_usd"] * tasa_conversion
            ).quantize(CENTAVOS, rounding=ROUND_HALF_UP)
            if monto_extra < 0:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="El monto no puede ser menor al costo de las carreras del estudiante.",
                )
        monto_extra = monto_extra.quantize(CENTAVOS, rounding=ROUND_HALF_UP)
        monto_total = _calcular_monto_total(
            cotizacion["monto_carreras_usd"],
            tasa_conversion,
            monto_extra,
        )
        if "monto" in update_data and "monto_extra" in update_data:
            if update_data["monto"].quantize(CENTAVOS) != monto_total:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                    detail="El monto enviado no coincide con carreras más extra a la tasa indicada.",
                )
        update_data["monto"] = monto_total
        update_data["monto_carreras_usd"] = cotizacion["monto_carreras_usd"]
        update_data["monto_extra"] = monto_extra
        update_data["tasa_conversion"] = tasa_conversion

    if estado == "pagado":
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
