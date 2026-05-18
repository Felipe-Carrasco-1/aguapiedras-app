from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from .models import CoordenadaRuta

def generate_ruta_pdf_buffer():
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    story = []
    
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'TitleStyle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1b5e20'),
        spaceAfter=15
    )
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['BodyText'],
        fontSize=11,
        leading=16,
        spaceAfter=10
    )
    
    story.append(Paragraph("Guia de Ruta Offline - Aguapiedras", title_style))
    story.append(Paragraph("Santuario de la Naturaleza Rio Achibueno, Pejerrey, Linares", styles['Heading3']))
    story.append(Spacer(1, 15))
    
    story.append(Paragraph("Guarda esta guia en tu telefono celular antes de ingresar a la cordillera, ya que gran parte de la ruta no cuenta con senal telefonica ni datos moviles. Sigue las instrucciones paso a paso para llegar de manera segura.", body_style))
    story.append(Spacer(1, 15))
    
    data = [["Hito", "Instrucciones de Ruta", "Coordenadas (Lat / Long)"]]
    hitos = CoordenadaRuta.objects.all().order_by('orden')
    for h in hitos:
        data.append([
            f"Punto {h.orden}",
            h.descripcion_hito,
            f"{h.latitud}, {h.longitud}"
        ])
        
    t = Table(data, colWidths=[60, 320, 150])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1b5e20')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.whitesmoke),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 10),
        ('BOTTOMPADDING', (0,0), (-1,0), 8),
        ('BACKGROUND', (0,1), (-1,-1), colors.HexColor('#f9f9f9')),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor('#dddddd')),
        ('FONTNAME', (0,1), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,1), (-1,-1), 9),
        ('TOPPADDING', (0,1), (-1,-1), 8),
        ('BOTTOMPADDING', (0,1), (-1,-1), 8),
    ]))
    
    story.append(t)
    doc.build(story)
    
    buffer.seek(0)
    return buffer
