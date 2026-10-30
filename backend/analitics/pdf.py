from fpdf import *

class PDFReport(FPDF):
    def header(self):
        # Cabecera institucional
        self.set_font('Helvetica', 'B', 14)
        self.set_text_color(251, 191, 36) # Color amarillo corporativo (#fbbf24)
        self.cell(0, 10, 'ACADEMIA AMADA FASHION', 0, 1, 'C')
        self.set_font('Helvetica', 'I', 10)
        self.set_text_color(150, 150, 150)
        self.cell(0, 5, 'Reporte Oficial de Módulo y Materias Asignadas', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font('Helvetica', 'I', 8)
        self.set_text_color(150, 150, 150)
        self.cell(0, 10, f'Página {self.page_no()}', 0, 0, 'C')