from fpdf import FPDF


class PDFModuloReport(FPDF):
    def header(self):
        self.set_font("Helvetica", "B", 14)
        self.set_text_color(251, 191, 36)
        self.cell(0, 10, "ACADEMIA AMADA FASHION", 0, 1, "C")
        self.set_font("Helvetica", "I", 10)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Reporte de Materias por Módulo Académico", 0, 1, "C")
        self.ln(5)

    def footer(self):
        self.set_y(-12)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 8, f"Página {self.page_no()}", 0, 0, "C")