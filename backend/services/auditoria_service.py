from datetime import datetime
from io import BytesIO
import json
from typing import Optional
from unicodedata import normalize

from fastapi import HTTPException, status
from fastapi.encoders import jsonable_encoder
from fpdf import FPDF
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