from datetime import datetime
from decimal import Decimal
from io import BytesIO

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

FILL_OSCURO = PatternFill(start_color="1F2937", end_color="1F2937", fill_type="solid")
FILL_AMBAR = PatternFill(start_color="FBBF24", end_color="FBBF24", fill_type="solid")
FILL_TARJETA = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")
FILL_ZEBRA = PatternFill(start_color="F9FAFB", end_color="F9FAFB", fill_type="solid")

FONT_TITULO = Font(name="Calibri", size=14, bold=True, color="FBBF24")
FONT_SUBTITULO = Font(name="Calibri", size=10, italic=True, color="E5E7EB")
FONT_TH = Font(name="Calibri", size=10, bold=True, color="FFFFFF")
FONT_TD = Font(name="Calibri", size=10, color="1F2937")
FONT_KPI_LBL = Font(name="Calibri", size=9, bold=True, color="4B5563")
FONT_KPI_VAL = Font(name="Calibri", size=12, bold=True, color="111827")

BORDE = Border(
    left=Side(style="thin", color="D1D5DB"),
    right=Side(style="thin", color="D1D5DB"),
    top=Side(style="thin", color="D1D5DB"),
    bottom=Side(style="thin", color="D1D5DB"),
)


def _estilizar(celda, *, font=None, fill=None, align="center", borde=False, num_fmt=None):
    if font:
        celda.font = font
    if fill:
        celda.fill = fill
    celda.alignment = Alignment(horizontal=align, vertical="center")
    if borde:
        celda.border = BORDE
    if num_fmt:
        celda.number_format = num_fmt


def generar_excel_mensualidades(
    mensualidades: list,
    periodos: dict[int, str],
    metodos: dict[int, str],
    monedas: dict[int, str],
) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Mensualidades"
    ws.views.sheetView[0].showGridLines = True

    ws.merge_cells("A1:G1")
    ws["A1"] = "ACADEMIA AMADA FASHION"
    _estilizar(ws["A1"], font=FONT_TITULO, fill=FILL_OSCURO)
    ws.row_dimensions[1].height = 26

    ws.merge_cells("A2:G2")
    ws["A2"] = f"Reporte de mensualidades · Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    _estilizar(ws["A2"], font=FONT_SUBTITULO, fill=FILL_OSCURO)
    ws.row_dimensions[2].height = 18

    total = len(mensualidades)
    acumulado = float(sum((Decimal(str(m.monto or 0)) for m in mensualidades), Decimal("0.00")))
    pagadas = sum(
        1
        for m in mensualidades
        if (m.estudiantes_asignados[0].estado if m.estudiantes_asignados else m.estado) == "pagado"
    )

    ws.row_dimensions[4].height = 18
    ws.row_dimensions[5].height = 24
    for col, etiqueta, valor, fmt in [
        ("A", "Total Mensualidades", total, None),
        ("C", "Monto Acumulado", acumulado, "#,##0.00"),
        ("F", "Pagadas", pagadas, None),
    ]:
        ws[f"{col}4"] = etiqueta
        _estilizar(ws[f"{col}4"], font=FONT_KPI_LBL, fill=FILL_TARJETA, borde=True)
        ws[f"{col}5"] = valor
        _estilizar(ws[f"{col}5"], font=FONT_KPI_VAL, fill=FILL_AMBAR, borde=True, num_fmt=fmt)

    encabezados = ["Período", "Monto", "Método", "Moneda", "Estudiante", "Fecha de corte", "Estado"]
    ws.row_dimensions[7].height = 22
    for idx, titulo in enumerate(encabezados, start=1):
        celda = ws.cell(row=7, column=idx, value=titulo)
        _estilizar(celda, font=FONT_TH, fill=FILL_OSCURO, borde=True)

    for fila, m in enumerate(mensualidades, start=8):
        asignaciones = getattr(m, "estudiantes_asignados", None) or []
        estudiantes_txt = (
            "; ".join(
                f"{getattr(a.datos_estudiante, 'nombreestu', '')} {getattr(a.datos_estudiante, 'apelliestu', '')} ({a.estudiante})".strip()
                for a in asignaciones
            )
            if asignaciones
            else "Sin estudiante asignado"
        )
        estados_txt = (
            "; ".join(
                f"{a.estado}" + (f" [Ref: {a.factura}]" if getattr(a, "factura", None) else "")
                for a in asignaciones
            )
            if asignaciones
            else str(m.estado or "")
        )

        valores = [
            periodos.get(m.periodo_id, f"ID {m.periodo_id}"),
            float(m.monto or 0),
            metodos.get(m.metodopago, f"ID {m.metodopago}"),
            monedas.get(m.monedapago, f"ID {m.monedapago}"),
            estudiantes_txt,
            str(m.fecha_corte or ""),
            estados_txt,
        ]
        ws.row_dimensions[fila].height = 20
        for col, val in enumerate(valores, start=1):
            celda = ws.cell(row=fila, column=col, value=val)
            alineacion = "right" if col == 2 else ("center" if col in (1, 6, 7) else "left")
            _estilizar(
                celda,
                font=FONT_TD,
                fill=FILL_ZEBRA if fila % 2 == 0 else None,
                align=alineacion,
                borde=True,
                num_fmt="#,##0.00" if col == 2 else None,
            )

    for col, ancho in enumerate([22, 15, 20, 20, 36, 16, 24], start=1):
        ws.column_dimensions[get_column_letter(col)].width = ancho
    ws.freeze_panes = "A8"

    salida = BytesIO()
    wb.save(salida)
    salida.seek(0)
    return salida.getvalue()