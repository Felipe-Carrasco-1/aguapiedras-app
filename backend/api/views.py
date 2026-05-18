from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from django.db import transaction
from django.db.models import Q
from .models import Cabana, Extra, CoordenadaRuta, Reserva, ReservaExtra
from .serializers import CabanaSerializer, ExtraSerializer, CoordenadaRutaSerializer, ReservaSerializer
from .mercadopago_service import create_preference
import mercadopago

class CabanaViewSet(viewsets.ModelViewSet):
    """
    Lista todas las cabañas o recupera una específica.
    """
    queryset = Cabana.objects.filter(activo=True)
    serializer_class = CabanaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=True, methods=['get'])
    def disponibilidad(self, request, pk=None):
        cabana = self.get_object()
        reservas = cabana.reservas.filter(
            estado__in=['pendiente', 'pagada', 'bloqueo_temporal']
        )
        fechas_ocupadas = []
        for r in reservas:
            fechas_ocupadas.append({
                'checkin': r.fecha_checkin.strftime('%Y-%m-%d'),
                'checkout': r.fecha_checkout.strftime('%Y-%m-%d')
            })
        return Response(fechas_ocupadas)

class ExtraViewSet(viewsets.ModelViewSet):
    queryset = Extra.objects.all()
    serializer_class = ExtraSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class RutaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CoordenadaRuta.objects.all().order_by('orden')
    serializer_class = CoordenadaRutaSerializer

    @action(detail=False, methods=['get'])
    def pdf(self, request):
        from django.http import HttpResponse
        from .pdf_service import generate_ruta_pdf_buffer
        
        pdf_buffer = generate_ruta_pdf_buffer()
        response = HttpResponse(pdf_buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="Guia_Ruta_Cordillerana.pdf"'
        return response

class ReservaViewSet(viewsets.ModelViewSet):
    queryset = Reserva.objects.all()
    serializer_class = ReservaSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        cabana_id = request.data.get('cabana')
        fecha_checkin = request.data.get('fecha_checkin')
        fecha_checkout = request.data.get('fecha_checkout')
        
        # Overbooking validation: check if there's any overlapping reservation
        # that is not cancelled
        overlapping = Reserva.objects.filter(
            cabana_id=cabana_id,
            estado__in=['pendiente', 'pagada', 'bloqueo_temporal']
        ).filter(
            Q(fecha_checkin__lt=fecha_checkout) & Q(fecha_checkout__gt=fecha_checkin)
        ).exists()

        if overlapping:
            return Response({'detail': 'Las fechas seleccionadas ya no están disponibles.'}, 
                            status=status.HTTP_400_BAD_REQUEST)

        # Create reservation
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reserva = serializer.save(estado='bloqueo_temporal')

        # Get Mercado Pago URL
        try:
            init_point = create_preference(reserva)
            # If it's a mock payment redirection in development, simulate successful payment immediately!
            if "payment_mock_success=true" in init_point:
                reserva.estado = 'pagada'
                reserva.save()
                
                # Trigger emails asynchronously!
                from .email_service import send_booking_confirmation_email, send_pre_trip_guidance_email
                send_booking_confirmation_email(reserva)
                send_pre_trip_guidance_email(reserva)
        except Exception as e:
            import traceback
            traceback.print_exc()
            reserva.estado = 'cancelada'
            reserva.save()
            return Response({'detail': f'Error al conectar con la pasarela de pago: {str(e)}'}, 
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({
            'reserva': serializer.data,
            'init_point': init_point
        }, status=status.HTTP_201_CREATED)

class NotificarPagoView(APIView):
    def post(self, request, *args, **kwargs):
        topic = request.query_params.get('topic')
        resource_id = request.query_params.get('id')
        
        notification_type = request.data.get('type')
        data_id = request.data.get('data', {}).get('id')
        
        payment_id = resource_id or data_id
        
        if payment_id and (topic == 'payment' or notification_type == 'payment'):
            try:
                sdk = mercadopago.SDK("TEST-1234567890123456-123456-abcdefg1234567890-1234567890")
                payment_info = sdk.payment().get(payment_id)
                payment_data = payment_info["response"]
                
                external_reference = payment_data.get("external_reference")
                status_mp = payment_data.get("status")
                
                if external_reference:
                    try:
                        reserva = Reserva.objects.get(id=external_reference)
                        if status_mp == 'approved':
                            reserva.estado = 'pagada'
                            reserva.save()
                            
                            # Trigger emails asynchronously!
                            from .email_service import send_booking_confirmation_email, send_pre_trip_guidance_email
                            send_booking_confirmation_email(reserva)
                            send_pre_trip_guidance_email(reserva)
                            
                        elif status_mp in ['rejected', 'cancelled', 'refunded']:
                            reserva.estado = 'cancelada'
                            reserva.save()
                    except Reserva.DoesNotExist:
                        pass
            except Exception as e:
                print(f"Error processing webhook: {e}")
                    
        return Response(status=status.HTTP_200_OK)
