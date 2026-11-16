from datetime import datetime
from io import BytesIO
from unicodedata import normalize
from fpdf import FPDF
from PIL import Image, ImageDraw, ImageFont


class PDFReportAuditoria(FPDF):
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
        # Maneja tanto si viene como Diccionario o como Objeto SQLAlchemy
        accion = str(reg.get("accion") if isinstance(reg, dict) else getattr(reg, "accion", "Desconocida"))
        escritor = str(reg.get("usuario_escritor_id") if isinstance(reg, dict) else getattr(reg, "usuario_escritor_id", "Sistema"))
        
        por_accion[accion] = por_accion.get(accion, 0) + 1
        por_usuario[escritor] = por_usuario.get(escritor, 0) + 1

    pdf = PDFReportAuditoria(orientation="L", unit="mm", format="A4")
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
    for etiqueta, valor in indicadores:
        pdf.set_font("Helvetica", "", 14)
        pdf.set_fill_color(245, 245, 245)
        pdf.cell(ancho_indicador, 7, etiqueta, border=1, align="C", fill=True)
    pdf.ln()
    for _, valor in indicadores:
        pdf.set_font("Helvetica", "B", 16)
        pdf.cell(ancho_indicador, 10, valor, border=1, align="C")
    pdf.ln(12)

    # Generación de gráficos en memoria
    grafico_acciones = _crear_grafico_barras(
        "Auditorias por tipo de accion",
        list(por_accion.keys())[:5],  # Top 5 acciones
        list(por_accion.values())[:5],
        (251, 191, 36),
    )
    grafico_usuarios = _crear_grafico_barras(
        "Actividad por usuario escritor",
        list(por_usuario.keys())[:5],  # Top 5 usuarios
        list(por_usuario.values())[:5],
        (59, 130, 246),
    )
    y_graficos = pdf.get_y()
    pdf.image(grafico_acciones, x=12, y=y_graficos, w=132)
    pdf.image(grafico_usuarios, x=151, y=y_graficos, w=132)

    # Segunda página: Detalle tabular de auditorías
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

        # Soporta acceso tanto si es dict como si es objeto SQLAlchemy
        if isinstance(reg, dict):
            fec = str(reg.get("fecha") or "")
            hor = str(reg.get("hora") or "")[:8]
            acc = str(reg.get("accion") or "")
            esc = str(reg.get("usuario_escritor_id") or "")
            obj = str(reg.get("usuario_objeto_id") or "—")
        else:
            fec = str(reg.fecha or "")
            hor = str(reg.hora or "")[:8]
            acc = str(reg.accion or "")
            esc = str(reg.usuario_escritor_id or "")
            obj = str(reg.usuario_objeto_id or "—")

        valores = [fec, hor, acc, esc, obj]
        pdf.set_fill_color(250, 250, 250)
        for valor, ancho in zip(valores, anchos):
            pdf.cell(ancho, 7, ajustar_texto(valor, ancho), border=1, align="L", fill=True)
        pdf.ln()

    return bytes(pdf.output())