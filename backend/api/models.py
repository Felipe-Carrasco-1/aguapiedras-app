from django.db import models

class Cabana(models.Model):
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    capacidad_max = models.IntegerField()
    precio_base = models.DecimalField(max_digits=10, decimal_places=2)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre

class CabanaImagen(models.Model):
    cabana = models.ForeignKey(Cabana, related_name='imagenes', on_delete=models.CASCADE)
    url_imagen = models.URLField()
    es_principal = models.BooleanField(default=False)

    def __str__(self):
        return f"Imagen de {self.cabana.nombre}"

class Extra(models.Model):
    TIPO_CHOICES = [
        ('noche', 'Por Noche'),
        ('estadia', 'Por Estadía'),
    ]
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField()
    precio = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    def __str__(self):
        return self.nombre

class Reserva(models.Model):
    ESTADO_CHOICES = [
        ('pendiente', 'Pendiente'),
        ('pagada', 'Pagada'),
        ('cancelada', 'Cancelada'),
        ('bloqueo_temporal', 'Bloqueo Temporal'),
    ]
    cabana = models.ForeignKey(Cabana, related_name='reservas', on_delete=models.CASCADE)
    nombre_cliente = models.CharField(max_length=200)
    email_cliente = models.EmailField()
    telefono_cliente = models.CharField(max_length=20)
    fecha_checkin = models.DateField()
    fecha_checkout = models.DateField()
    total_pago = models.DecimalField(max_digits=10, decimal_places=2)
    estado = models.CharField(max_length=20, choices=ESTADO_CHOICES, default='pendiente')
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Reserva {self.id} - {self.nombre_cliente}"

class ReservaExtra(models.Model):
    reserva = models.ForeignKey(Reserva, related_name='extras_reservados', on_delete=models.CASCADE)
    extra = models.ForeignKey(Extra, on_delete=models.CASCADE)
    cantidad = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.cantidad} x {self.extra.nombre} para {self.reserva.id}"

class CoordenadaRuta(models.Model):
    orden = models.IntegerField()
    latitud = models.DecimalField(max_digits=9, decimal_places=6)
    longitud = models.DecimalField(max_digits=9, decimal_places=6)
    descripcion_hito = models.CharField(max_length=255)

    def __str__(self):
        return f"Hito {self.orden}: {self.descripcion_hito}"

class Resena(models.Model):
    cabana = models.ForeignKey(Cabana, related_name='resenas', on_delete=models.CASCADE)
    reserva = models.ForeignKey(Reserva, on_delete=models.CASCADE)
    puntuacion = models.IntegerField()
    comentario = models.TextField()
    fecha = models.DateField(auto_now_add=True)

    def __str__(self):
        return f"Reseña de {self.cabana.nombre} - {self.puntuacion} estrellas"
