from datetime import datetime
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


def _estilizar(celda, *, font=None, fill=None, align="center", borde=False):
    if font:
        celda.font = font
    if fill:
        celda.fill = fill
    celda.alignment = Alignment(horizontal=align, vertical="center")
    if borde:
        celda.border = BORDE


def generar_excel_nomina_estudiantes(
    estudiantes: list,
    *,
    titulo_extra: str | None = None,
) -> bytes:
    wb = Workbook()
    ws = wb.active
    ws.title = "Nomina Estudiantes"

    ws.merge_cells("A1:F1")
    ws["A1"] = "ACADEMIA AMADA FASHION"
    _estilizar(ws["A1"], font=FONT_TITULO, fill=FILL_OSCURO)
    ws.row_dimensions[1].height = 26

    subtitulo = "Nómina de estudiantes"
    if titulo_extra:
        subtitulo = f"{subtitulo} · {titulo_extra}"
    ws.merge_cells("A2:F2")
    ws["A2"] = f"{subtitulo} · Generado: {datetime.now().strftime('%Y-%m-%d %H:%M')}"
    _estilizar(ws["A2"], font=FONT_SUBTITULO, fill=FILL_OSCURO)
    ws.row_dimensions[2].height = 18

    total = len(estudiantes)
    activos = sum(1 for e in estudiantes if getattr(e, "activo", True))
    inactivos = total - activos

    ws.row_dimensions[4].height = 18
    ws.row_dimensions[5].height = 24
    for col, etiqueta, valor in [
        ("A", "Total", total),
        ("C", "Activos", activos),
        ("E", "Inactivos", inactivos),
    ]:
        ws[f"{col}4"] = etiqueta
        _estilizar(ws[f"{col}4"], font=FONT_KPI_LBL, fill=FILL_TARJETA, borde=True)
        ws[f"{col}5"] = valor
        _estilizar(ws[f"{col}5"], font=FONT_KPI_VAL, fill=FILL_AMBAR, borde=True)

    encabezados = ["#", "Cédula", "Nombre", "Apellido", "Teléfono", "Correo"]
    ws.row_dimensions[7].height = 22
    for idx, titulo in enumerate(encabezados, start=1):
        celda = ws.cell(row=7, column=idx, value=titulo)
        _estilizar(celda, font=FONT_TH, fill=FILL_OSCURO, borde=True)

    for i, e in enumerate(estudiantes, start=8):
        valores = [
            i - 7,
            getattr(e, "ciestu", "") or "",
            getattr(e, "nombreestu", "") or "",
            getattr(e, "apelliestu", "") or "",
            getattr(e, "teleestu", "") or "",
            getattr(e, "correoestu", "") or "",
        ]
        ws.row_dimensions[i].height = 20
        for col, val in enumerate(valores, start=1):
            celda = ws.cell(row=i, column=col, value=val)
            align = "left" if col in (3, 4, 6) else "center"
            _estilizar(
                celda,
                font=FONT_TD,
                fill=FILL_ZEBRA if i % 2 == 0 else None,
                align=align,
                borde=True,
            )

    for col, ancho in enumerate([6, 16, 22, 22, 16, 32], start=1):
        ws.column_dimensions[get_column_letter(col)].width = ancho
    ws.freeze_panes = "A8"

    salida = BytesIO()
    wb.save(salida)
    salida.seek(0)
    return salida.getvalue()