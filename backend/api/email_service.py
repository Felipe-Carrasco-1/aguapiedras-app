import threading
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
from .pdf_service import generate_ruta_pdf_buffer

def send_async_email(email_message):
    # Starts background thread to dispatch email without delaying user HTTP response
    thread = threading.Thread(target=email_message.send)
    thread.start()

def send_booking_confirmation_email(reserva):
    subject = f"Confirmacion de Reserva: {reserva.cabana.nombre} en Aguapiedras"
    
    # Text version of email body
    body = f"""
    Hola {reserva.nombre_cliente},
    
    ¡Tu reserva ha sido procesada con exito!
    
    Detalles de tu estadia:
    - Cabana: {reserva.cabana.nombre}
    - Check-in: {reserva.fecha_checkin}
    - Check-out: {reserva.fecha_checkout}
    - Total Pagado: ${reserva.total_pago}
    - Estado de Pago: {reserva.estado.upper()}
    
    Puedes ver las indicaciones de ruta cordillerana e instrucciones offline ingresando al siguiente enlace:
    http://localhost:4200/ruta
    
    Esperamos que disfrutes de tu estadia en el Cajon del Achibueno.
    
    Atentamente,
    Equipo Aguapiedras
    """
    
    email = EmailMessage(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [reserva.email_cliente]
    )
    send_async_email(email)

def send_pre_trip_guidance_email(reserva):
    subject = f"Guia de Viaje Cordillerana y Recordatorio de Estadía - Aguapiedras"
    
    body = f"""
    Hola {reserva.nombre_cliente},
    
    Tu proxima estadia en {reserva.cabana.nombre} esta muy cerca.
    
    Queremos recordarte que el Cajon del Achibueno es una zona cordillerana protegida, por lo que NO hay senal de telefonia celular ni datos en gran parte del trayecto.
    
    Adjuntamos a este correo la Guia de Ruta Cordillerana Completa en formato PDF para que la descargues en tu telefono y la utilices de manera offline durante tu viaje.
    
    ¡Nos vemos pronto!
    Equipo Aguapiedras
    """
    
    email = EmailMessage(
        subject,
        body,
        settings.DEFAULT_FROM_EMAIL,
        [reserva.email_cliente]
    )
    
    # Generate and attach the PDF dynamically using our pdf_service!
    pdf_buffer = generate_ruta_pdf_buffer()
    email.attach("Guia_Ruta_Cordillerana.pdf", pdf_buffer.getvalue(), "application/pdf")
    
    send_async_email(email)
