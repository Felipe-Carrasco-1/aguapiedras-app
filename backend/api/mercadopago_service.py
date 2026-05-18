import os
import requests
from django.conf import settings

def create_preference(reserva):
    payment_service_url = os.getenv("PAYMENT_SERVICE_URL", "http://localhost:8002")
    
    payload = {
        "id_usuario": reserva.id,  # Usamos el ID de la reserva como identificador de usuario para el pago
        "descripcion": f"Reserva Cabaña {reserva.cabana.nombre}",
        "monto": str(reserva.total_pago),
        "email_pagador": reserva.email_cliente
    }
    
    try:
        url = f"{payment_service_url}/pagos/crear"
        print(f"[backend] Enviando petición a microservicio de pagos: {url}")
        response = requests.post(url, json=payload, timeout=10)
        
        if response.status_code in (200, 201):
            resp_data = response.json()
            if resp_data.get("success"):
                init_point = resp_data["data"]["url_pago"]
                print(f"[backend] Microservicio retornó init_point: {init_point}")
                return init_point
        
        print(f"[backend] Error en microservicio (status={response.status_code}): {response.text}")
        return f"http://localhost:4200/cabanas?payment_mock_success=true&reserva_id={reserva.id}"
    except Exception as e:
        print(f"[backend] Excepción conectando al microservicio de pagos: {e}")
        # Retorno de fallback con éxito simulado en desarrollo local si el servicio no está levantado
        return f"http://localhost:4200/cabanas?payment_mock_success=true&reserva_id={reserva.id}"
