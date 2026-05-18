from rest_framework import serializers
from .models import Cabana, CabanaImagen, Extra, Reserva, CoordenadaRuta, Resena, ReservaExtra

class CabanaImagenSerializer(serializers.ModelSerializer):
    class Meta:
        model = CabanaImagen
        fields = ['id', 'url_imagen', 'es_principal']

class ResenaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resena
        fields = ['id', 'puntuacion', 'comentario', 'fecha']

class CabanaSerializer(serializers.ModelSerializer):
    imagenes = CabanaImagenSerializer(many=True, read_only=True)
    resenas = ResenaSerializer(many=True, read_only=True)

    class Meta:
        model = Cabana
        fields = ['id', 'nombre', 'descripcion', 'capacidad_max', 'precio_base', 'activo', 'imagenes', 'resenas']

class ExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Extra
        fields = '__all__'

class CoordenadaRutaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoordenadaRuta
        fields = '__all__'

class ReservaExtraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReservaExtra
        fields = ['extra', 'cantidad']

class ReservaSerializer(serializers.ModelSerializer):
    extras_reservados = ReservaExtraSerializer(many=True, required=False)

    class Meta:
        model = Reserva
        fields = ['id', 'cabana', 'nombre_cliente', 'email_cliente', 'telefono_cliente', 
                  'fecha_checkin', 'fecha_checkout', 'total_pago', 'estado', 'extras_reservados']
        read_only_fields = ['id', 'estado']

    def create(self, validated_data):
        extras_data = validated_data.pop('extras_reservados', [])
        reserva = Reserva.objects.create(**validated_data)
        for extra_item in extras_data:
            ReservaExtra.objects.create(reserva=reserva, **extra_item)
        return reserva

