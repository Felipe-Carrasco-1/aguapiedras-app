from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CabanaViewSet, ExtraViewSet, RutaViewSet, ReservaViewSet, NotificarPagoView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'cabanas', CabanaViewSet, basename='cabana')
router.register(r'extras', ExtraViewSet, basename='extra')
router.register(r'ruta', RutaViewSet, basename='ruta')
router.register(r'reservas', ReservaViewSet, basename='reserva')

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('pagos/notificar/', NotificarPagoView.as_view(), name='notificar_pago'),
    path('', include(router.urls)),
]
