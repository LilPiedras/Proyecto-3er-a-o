from datetime import datetime
from io import BytesIO
import json
from typing import Optional
from unicodedata import normalize

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from fpdf import FPDF
from openpyxl import Workbook
from openpyxl.chart import PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from PIL import Image, ImageDraw, ImageFont
from sqlalchemy import extract
from sqlalchemy.orm import Session, aliased

from models.auditoria_model import Auditoria
from models.usuario_model import Usuario


class _PDFReportAuditoria(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(251, 191, 36)
        self.cell(0, 10, "ACADEMIA AMADA FASHION", 0, 1, "C")
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Reporte de auditorias y control del sistema", 0, 1, "C")
        self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Pagina {self.page_no()}", 0, 0, "C")


def _texto_grafico(texto: str) -> str:
    return normalize("NFKD", texto).encode("ascii", "ignore").decode("ascii")


def _crear_grafico_barras(
    titulo: str,
    etiquetas: list[str],
    valores: list[int],
    color: tuple[int, int, int],
) -> BytesIO:
    ancho, alto = 1200, 420
    imagen = Image.new("RGB", (ancho, alto), "white")
    dibujo = ImageDraw.Draw(imagen)
    fuente = ImageFont.load_default()
    dibujo.text((36, 24), _texto_grafico(titulo), fill=(35, 35, 35), font=fuente)

    izquierda, derecha, arriba, base = 55, ancho - 30, 75, alto - 82
    dibujo.line((izquierda, arriba, izquierda, base, derecha, base), fill=(150, 150, 150), width=2)

    if not etiquetas:
        dibujo.text((izquierda + 20, arriba + 60), "Sin datos disponibles", fill=(100, 100, 100), font=fuente)
    else:
        maximo = max(valores, default=0) or 1
        espacio = (derecha - izquierda) / len(etiquetas)
        ancho_barra = max(8, int(espacio * 0.56))
        for indice, (etiqueta, valor) in enumerate(zip(etiquetas, valores)):
            centro = izquierda + espacio * (indice + 0.5)
            altura_barra = int((base - arriba - 28) * valor / maximo)
            x1 = int(centro - ancho_barra / 2)
            x2 = int(centro + ancho_barra / 2)
            y1 = base - altura_barra
            dibujo.rectangle((x1, y1, x2, base), fill=color)
            dibujo.text((int(centro - 8), max(arriba, y1 - 20)), str(valor), fill=(35, 35, 35), font=fuente)
            etiqueta_corta = _texto_grafico(etiqueta)[:14]
            caja = dibujo.textbbox((0, 0), etiqueta_corta, font=fuente)
            ancho_texto = caja[2] - caja[0]
            dibujo.text((int(centro - ancho_texto / 2), base + 14), etiqueta_corta, fill=(70, 70, 70), font=fuente)

    salida = BytesIO()
    imagen.save(salida, format="PNG")
    salida.seek(0)
    return salida


def crear_pdf_auditorias(registros: list) -> bytes:
    total = len(registros)
    por_accion: dict[str, int] = {}
    por_usuario: dict[str, int] = {}

    for reg in registros:
        if isinstance(reg, dict):
            accion = str(reg.get("accion") or "Desconocida")
            escritor = str(
                reg.get("usuario_escritor_nombre")
                or reg.get("usuario_escritor_id")
                or "Sistema"
            )
        else:
            accion = str(getattr(reg, "accion", None) or "Desconocida")
            escritor = str(getattr(reg, "usuario_escritor_id", None) or "Sistema")

        por_accion[accion] = por_accion.get(accion, 0) + 1
        por_usuario[escritor] = por_usuario.get(escritor, 0) + 1

    pdf = _PDFReportAuditoria(orientation="L", unit="mm", format="A4")
    pdf.set_auto_page_break(auto=True, margin=16)
    pdf.add_page()
    pdf.set_text_color(35, 35, 35)
    pdf.set_font("Helvetica", "", 12)
    pdf.cell(0, 6, f"Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}", 0, 1, "R")
    pdf.ln(3)

    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 8, "Indicadores generales de auditoria", 0, 1)

    indicadores = [
        ("Total Registros", str(total)),
        ("Acciones registradas", str(len(por_accion))),
        ("Usuarios activos", str(len(por_usuario))),
    ]
    ancho_indicador = 90
    for etiqueta, _ in indicadores:
        pdf.set_font("Helvetica", "", 14)
        pdf.set_fill_color(245, 245, 245)
        pdf.cell(ancho_indicador, 7, etiqueta, border=1, align="C", fill=True)
    pdf.ln()
    for _, valor in indicadores:
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(ancho_indicador, 10, valor, border=1, align="C")
    pdf.ln(12)

    grafico_acciones = _crear_grafico_barras(
        "Auditorias por tipo de accion",
        list(por_accion.keys())[:5],
        list(por_accion.values())[:5],
        (251, 191, 36),
    )
    grafico_usuarios = _crear_grafico_barras(
        "Actividad por usuario escritor",
        list(por_usuario.keys())[:5],
        list(por_usuario.values())[:5],
        (59, 130, 246),
    )
    y_graficos = pdf.get_y()
    pdf.image(grafico_acciones, x=12, y=y_graficos, w=132)
    pdf.image(grafico_usuarios, x=151, y=y_graficos, w=132)

    pdf.add_page()
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 8, "Detalle de registros de auditoria", 0, 1)

    encabezados = ["Fecha", "Hora", "Accion", "Usuario Escritor", "Usuario Afectado"]
    anchos = [35, 25, 70, 80, 70]

    def escribir_encabezados():
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(31, 41, 55)
        pdf.set_text_color(255, 255, 255)
        for encabezado, ancho in zip(encabezados, anchos):
            pdf.cell(ancho, 8, encabezado, border=1, align="C", fill=True)
        pdf.ln()
        pdf.set_text_color(35, 35, 35)
        pdf.set_font("Helvetica", "", 8)

    def ajustar_texto(texto: str, ancho: float) -> str:
        original = str(texto or "")
        texto = original
        while texto and pdf.get_string_width(texto) > ancho - 2:
            texto = texto[:-1]
        if texto != original:
            texto = texto[:-3] + "..." if len(texto) > 3 else "..."
        return texto

    escribir_encabezados()
    for reg in registros:
        if pdf.get_y() > 185:
            pdf.add_page()
            escribir_encabezados()

        if isinstance(reg, dict):
            fec = str(reg.get("fecha") or "")
            hor = str(reg.get("hora") or "")[:8]
            acc = str(reg.get("accion") or "")
            esc = str(reg.get("usuario_escritor_nombre") or reg.get("usuario_escritor_id") or "Sistema")
            obj = str(reg.get("usuario_objeto_nombre") or reg.get("usuario_objeto_id") or "—")
        else:
            fec = str(getattr(reg, "fecha", None) or "")
            hor = str(getattr(reg, "hora", None) or "")[:8]
            acc = str(getattr(reg, "accion", None) or "")
            esc = str(getattr(reg, "usuario_escritor_id", None) or "Sistema")
            obj = str(getattr(reg, "usuario_objeto_id", None) or "—")

        valores = [fec, hor, acc, esc, obj]
        pdf.set_fill_color(250, 250, 250)
        for valor, ancho in zip(valores, anchos):
            pdf.cell(ancho, 7, ajustar_texto(valor, ancho), border=1, align="L", fill=True)
        pdf.ln()

    return bytes(pdf.output())


def crear_excel_auditorias(registros: list) -> bytes:
    total = len(registros)
    por_accion: dict[str, int] = {}
    por_usuario: dict[str, int] = {}

    for reg in registros:
        if isinstance(reg, dict):
            accion = str(reg.get("accion") or "Desconocida")
            escritor = str(
                reg.get("usuario_escritor_nombre")
                or reg.get("usuario_escritor_id")
                or "Sistema"
            )
        else:
            accion = str(getattr(reg, "accion", None) or "Desconocida")
            escritor = str(getattr(reg, "usuario_escritor_id", None) or "Sistema")

        por_accion[accion] = por_accion.get(accion, 0) + 1
        por_usuario[escritor] = por_usuario.get(escritor, 0) + 1

    wb = Workbook()

    ws_detalle = wb.active
    ws_detalle.title = "Detalle Auditorias"
    ws_detalle.views.sheetView[0].showGridLines = True

    fill_oscuro = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
    fill_ambar = PatternFill(start_color="FBBF24", end_color="FBBF24", fill_type="solid")
    fill_tarjeta = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")
    fill_zebra = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")

    font_titulo = Font(name="Calibri", size=14, bold=True, color="FBBF24")
    font_subtitulo = Font(name="Calibri", size=10, italic=True, color="E5E7EB")
    font_th = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
    font_td = Font(name="Calibri", size=10, color="1F2937")
    font_kpi_lbl = Font(name="Calibri", size=9, bold=True, color="4B5563")
    font_kpi_val = Font(name="Calibri", size=13, bold=True, color="111827")

    borde_fino = Border(
        left=Side(style="thin", color="D1D5DB"),
        right=Side(style="thin", color="D1D5DB"),
        top=Side(style="thin", color="D1D5DB"),
        bottom=Side(style="thin", color="D1D5DB"),
    )

    ws_detalle.merge_cells("A1:E1")
    ws_detalle["A1"] = "ACADEMIA AMADA FASHION"
    ws_detalle["A1"].font = font_titulo
    ws_detalle["A1"].fill = fill_oscuro
    ws_detalle["A1"].alignment = Alignment(horizontal="center", vertical="center")
    ws_detalle.row_dimensions[1].height = 26

    ws_detalle.merge_cells("A2:E2")
    ws_detalle["A2"] = f"Reporte de auditorías y control del sistema · Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    ws_detalle["A2"].font = font_subtitulo
    ws_detalle["A2"].fill = fill_oscuro
    ws_detalle["A2"].alignment = Alignment(horizontal="center", vertical="center")
    ws_detalle.row_dimensions[2].height = 18

    kpis = [
        ("A", "Total Registros", total),
        ("C", "Acciones Registradas", len(por_accion)),
        ("E", "Usuarios Activos", len(por_usuario)),
    ]
    ws_detalle.row_dimensions[4].height = 18
    ws_detalle.row_dimensions[5].height = 24
    for col, etiqueta, valor in kpis:
        ws_detalle[f"{col}4"] = etiqueta
        ws_detalle[f"{col}4"].font = font_kpi_lbl
        ws_detalle[f"{col}4"].fill = fill_tarjeta
        ws_detalle[f"{col}4"].alignment = Alignment(horizontal="center", vertical="center")
        ws_detalle[f"{col}4"].border = borde_fino

        ws_detalle[f"{col}5"] = valor
        ws_detalle[f"{col}5"].font = font_kpi_val
        ws_detalle[f"{col}5"].fill = fill_ambar
        ws_detalle[f"{col}5"].alignment = Alignment(horizontal="center", vertical="center")
        ws_detalle[f"{col}5"].border = borde_fino

    encabezados = ["Fecha", "Hora", "Acción", "Usuario Escritor", "Usuario Afectado"]
    fila_inicio_tabla = 7
    ws_detalle.row_dimensions[fila_inicio_tabla].height = 22
    for idx, titulo_col in enumerate(encabezados, start=1):
        celda = ws_detalle.cell(row=fila_inicio_tabla, column=idx, value=titulo_col)
        celda.font = font_th
        celda.fill = fill_oscuro
        celda.alignment = Alignment(horizontal="center", vertical="center")
        celda.border = borde_fino

    for i, reg in enumerate(registros, start=fila_inicio_tabla + 1):
        if isinstance(reg, dict):
            fec = str(reg.get("fecha") or "")
            hor = str(reg.get("hora") or "")[:8]
            acc = str(reg.get("accion") or "")
            esc = str(reg.get("usuario_escritor_nombre") or reg.get("usuario_escritor_id") or "Sistema")
            obj = str(reg.get("usuario_objeto_nombre") or reg.get("usuario_objeto_id") or "—")
        else:
            fec = str(getattr(reg, "fecha", None) or "")
            hor = str(getattr(reg, "hora", None) or "")[:8]
            acc = str(getattr(reg, "accion", None) or "")
            esc = str(getattr(reg, "usuario_escritor_id", None) or "Sistema")
            obj = str(getattr(reg, "usuario_objeto_id", None) or "—")

        fila_valores = [fec, hor, acc, esc, obj]
        ws_detalle.row_dimensions[i].height = 19
        for col_idx, val in enumerate(fila_valores, start=1):
            celda = ws_detalle.cell(row=i, column=col_idx, value=val)
            celda.font = font_td
            celda.border = borde_fino
            celda.alignment = Alignment(
                horizontal="center" if col_idx in (1, 2) else "left",
                vertical="center",
            )
            if i % 2 == 0:
                celda.fill = fill_zebra

    anchos = [15, 13, 34, 32, 32]
    for col_idx, ancho in enumerate(anchos, start=1):
        ws_detalle.column_dimensions[get_column_letter(col_idx)].width = ancho

    ws_detalle.freeze_panes = f"A{fila_inicio_tabla + 1}"

    ws_resumen = wb.create_sheet(title="Resumen y Grafica")
    ws_resumen["A1"] = "Distribución de Auditorías por Acción"
    ws_resumen["A1"].font = Font(name="Calibri", size=13, bold=True, color="1F2937")

    ws_resumen["A3"] = "Acción"
    ws_resumen["B3"] = "Cantidad"
    for col_idx in (1, 2):
        c = ws_resumen.cell(row=3, column=col_idx)
        c.font = font_th
        c.fill = fill_oscuro
        c.alignment = Alignment(horizontal="center")
        c.border = borde_fino

    acciones_ordenadas = sorted(por_accion.items(), key=lambda x: x[1], reverse=True)
    for idx, (accion_nombre, cant) in enumerate(acciones_ordenadas, start=4):
        c_acc = ws_resumen.cell(row=idx, column=1, value=accion_nombre)
        c_cnt = ws_resumen.cell(row=idx, column=2, value=cant)
        c_acc.font = font_td
        c_cnt.font = font_td
        c_acc.border = borde_fino
        c_cnt.border = borde_fino

    ws_resumen.column_dimensions["A"].width = 36
    ws_resumen.column_dimensions["B"].width = 14

    if acciones_ordenadas:
        torta = PieChart()
        torta.title = "Auditorías por tipo de acción"
        torta.style = 10
        datos_ref = Reference(ws_resumen, min_col=2, min_row=3, max_row=3 + len(acciones_ordenadas))
        etiquetas_ref = Reference(ws_resumen, min_col=1, min_row=4, max_row=3 + len(acciones_ordenadas))
        torta.add_data(datos_ref, titles_from_data=True)
        torta.set_categories(etiquetas_ref)
        torta.dataLabels = DataLabelList()
        torta.dataLabels.showPercent = True
        torta.width = 16
        torta.height = 10
        ws_resumen.add_chart(torta, "D3")

    salida = BytesIO()
    wb.save(salida)
    salida.seek(0)
    return salida.getvalue()


def registrar_auditoria_txt(db: Session, escritor_id: str, objeto_id: str, accion: str, dato_viejo=None, dato_nuevo=None):
    momento = datetime.now()
    txt_viejo = json.dumps(jsonable_encoder(dato_viejo)) if dato_viejo else None
    txt_nuevo = json.dumps(jsonable_encoder(dato_nuevo)) if dato_nuevo else None
    auditoria = Auditoria(
        usuario_escritor_id=escritor_id,
        usuario_objeto_id=objeto_id,
        accion=accion,
        datos_anteriores=txt_viejo,
        datos_nuevos=txt_nuevo,
        fecha=momento.date(),
        hora=momento.time(),
    )
    db.add(auditoria)


def listar_auditorias(
    db: Session,
    mes: Optional[int] = None,
    dia: Optional[int] = None,
    hora: Optional[int] = None,
):
    consulta = _consulta_con_nombres(db)
    if mes is not None:
        consulta = consulta.filter(extract("month", Auditoria.fecha) == mes)
    if dia is not None:
        consulta = consulta.filter(extract("day", Auditoria.fecha) == dia)
    if hora is not None:
        consulta = consulta.filter(extract("hour", Auditoria.hora) == hora)
    filas = consulta.order_by(
        Auditoria.fecha.desc(),
        Auditoria.hora.desc().nullslast(),
        Auditoria.idseria.desc(),
    ).all()
    return [_auditoria_con_nombres(*fila) for fila in filas]


def obtener_pdf_auditorias(
    db: Session,
    mes: Optional[int] = None,
    dia: Optional[int] = None,
    hora: Optional[int] = None,
) -> bytes:
    registros = listar_auditorias(db, mes=mes, dia=dia, hora=hora)
    return crear_pdf_auditorias(registros)


def obtener_excel_auditorias(
    db: Session,
    mes: Optional[int] = None,
    dia: Optional[int] = None,
    hora: Optional[int] = None,
) -> bytes:
    registros = listar_auditorias(db, mes=mes, dia=dia, hora=hora)
    return crear_excel_auditorias(registros)


def obtener_auditoria_por_id(idseria: int, db: Session):
    fila = _consulta_con_nombres(db).filter(Auditoria.idseria == idseria).first()
    if fila is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La auditoria no fue encontrada")
    return _auditoria_con_nombres(*fila)


def _consulta_con_nombres(db: Session):
    escritor = aliased(Usuario)
    objeto = aliased(Usuario)
    return db.query(
        Auditoria,
        escritor.nombreusuario,
        escritor.apellusuario,
        objeto.nombreusuario,
        objeto.apellusuario,
    ).outerjoin(
        escritor, Auditoria.usuario_escritor_id == escritor.ciuser
    ).outerjoin(
        objeto, Auditoria.usuario_objeto_id == objeto.ciuser
    )


def _auditoria_con_nombres(auditoria, escritor_nombre, escritor_apellido, objeto_nombre, objeto_apellido):
    datos = {
        campo: getattr(auditoria, campo)
        for campo in (
            "idseria",
            "usuario_escritor_id",
            "usuario_objeto_id",
            "accion",
            "datos_anteriores",
            "datos_nuevos",
            "fecha",
            "hora",
        )
    }
    datos["usuario_escritor_nombre"] = " ".join(
        parte for parte in (escritor_nombre, escritor_apellido) if parte
    ) or None
    datos["usuario_objeto_nombre"] = " ".join(
        parte for parte in (objeto_nombre, objeto_apellido) if parte
    ) or None
    return datos