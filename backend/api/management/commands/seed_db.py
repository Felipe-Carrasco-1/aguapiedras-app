from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import Cabana, CabanaImagen, Extra, CoordenadaRuta, Resena, Reserva
from decimal import Decimal
import datetime

class Command(BaseCommand):
    help = 'Poblar la base de datos con datos de prueba de Aguapiedras'

    def handle(self, *args, **options):
        self.stdout.write('Limpiando base de datos existente...')
        Resena.objects.all().delete()
        Reserva.objects.all().delete()
        CabanaImagen.objects.all().delete()
        Cabana.objects.all().delete()
        Extra.objects.all().delete()
        CoordenadaRuta.objects.all().delete()

        self.stdout.write('Poblando cabañas...')
        
        # 1. Cabana 1: Blanca
        c1 = Cabana.objects.create(
            nombre="Cabaña Blanca",
            descripcion="Acogedora y luminosa cabaña de madera en medio del bosque nativo. Equipada para 2 a 4 personas. Cuenta con terraza de 12 metros cuadrados con parrilla privada, cocina totalmente equipada, living-comedor y baño privado. Ubicada en un entorno de privacidad real a pasos del cristalino Río Achibueno, ideal para descansar y desconectarse en pareja o en familia.",
            capacidad_max=4,
            precio_base=Decimal("75000.00"),
            activo=True
        )
        CabanaImagen.objects.create(
            cabana=c1,
            url_imagen="https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=800&q=80",
            es_principal=True
        )
        CabanaImagen.objects.create(
            cabana=c1,
            url_imagen="https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
            es_principal=False
        )

        # 2. Cabana 2: Verde
        c2 = Cabana.objects.create(
            nombre="Cabaña Verde",
            descripcion="Espectacular cabaña familiar rodeada de la exuberante vegetación de Pejerrey. Capacidad para 3 a 5 personas. Ofrece una amplia terraza privada, quincho para asados, living-comedor espacioso, cocina americana completa y estufa a leña para los días fríos. Diseñada con detalles que hacen grata tu estadía a solo minutos de los pozones naturales del río.",
            capacidad_max=5,
            precio_base=Decimal("85000.00"),
            activo=True
        )
        CabanaImagen.objects.create(
            cabana=c2,
            url_imagen="https://images.unsplash.com/photo-1588880331179-bc9b93a8c5d8?auto=format&fit=crop&w=800&q=80",
            es_principal=True
        )
        CabanaImagen.objects.create(
            cabana=c2,
            url_imagen="https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&w=800&q=80",
            es_principal=False
        )

        # 3. Cabana 3: Café
        c3 = Cabana.objects.create(
            nombre="Cabaña Café",
            descripcion="Nuestra cabaña más grande y exclusiva, perfecta para grupos familiares o de amigos. Equipada para 4 a 6 personas, cuenta con 3 dormitorios, living-comedor amplio, cocina completa con electrodomésticos, baño privado y una gran terraza con parrilla propia. Cuenta con una estufa de alto rendimiento (bosca) a leña para garantizar calidez total en invierno.",
            capacidad_max=6,
            precio_base=Decimal("95000.00"),
            activo=True
        )
        CabanaImagen.objects.create(
            cabana=c3,
            url_imagen="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80",
            es_principal=True
        )
        CabanaImagen.objects.create(
            cabana=c3,
            url_imagen="https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80",
            es_principal=False
        )

        self.stdout.write('Poblando extras...')
        # Extras
        Extra.objects.create(
            nombre="Tinaja Caliente",
            descripcion="Sumérgete en nuestra tinaja caliente y desconéctate completamente. Rodeada de naturaleza, sus aguas cálidas son ideales para relajarte después de un día de trekking, natación en pozones o simplemente para disfrutar la tranquilidad del Achibueno.",
            precio=Decimal("35000.00"),
            tipo="estadia"
        )
        Extra.objects.create(
            nombre="Masaje Tailandés - 30 min",
            descripcion="Alivia tensiones, mejora la circulación y revitaliza tu cuerpo y mente con un masaje tailandés tradicional de 30 minutos en un ambiente tranquilo y natural.",
            precio=Decimal("15000.00"),
            tipo="estadia"
        )
        Extra.objects.create(
            nombre="Masaje Tailandés - 60 min",
            descripcion="Sesión completa de 60 minutos de masaje tailandés tradicional. Alivia contracturas, estira musculatura y devuelve la armonía a tu cuerpo.",
            precio=Decimal("25000.00"),
            tipo="estadia"
        )
        Extra.objects.create(
            nombre="Masaje Tailandés - 90 min",
            descripcion="Nuestra sesión más exclusiva de 90 minutos de masaje tailandés tradicional. Relajación total profunda en medio de la serenidad del bosque nativo.",
            precio=Decimal("35000.00"),
            tipo="estadia"
        )
        Extra.objects.create(
            nombre="Desayuno a la Cabaña (Canasta)",
            descripcion="Delicioso desayuno en canasta llevado directamente a tu cabaña: pan casero recién horneado, mantequilla, mermelada casera, queso, huevos de campo, fruta de la estación, jugo natural, café o té y leche.",
            precio=Decimal("7000.00"),
            tipo="noche"
        )
        Extra.objects.create(
            nombre="Canasta de Repostería & Pan Casero",
            descripcion="Disfruta de una exquisita canasta artesanal con kuchenes, queques, pies dulces y pan casero recién horneado elaborado con ingredientes frescos locales.",
            precio=Decimal("10000.00"),
            tipo="estadia"
        )
        Extra.objects.create(
            nombre="Caja de Leña Adicional",
            descripcion="Caja extra de astillas secas y leña de roble/quillay de alta calidad para calefacción (estufa bosca) o asados.",
            precio=Decimal("5000.00"),
            tipo="noche"
        )

        self.stdout.write('Poblando reseñas reales de Google...')
        # Crear reservas ficticias para asociar las reseñas
        r1_a = Reserva.objects.create(cabana=c1, nombre_cliente="Alina Catalán", email_cliente="alina@gmail.com", telefono_cliente="+56912345678", fecha_checkin=datetime.date(2026, 4, 1), fecha_checkout=datetime.date(2026, 4, 3), total_pago=Decimal("150000.00"), estado="pagada")
        Resena.objects.create(cabana=c1, reserva=r1_a, puntuacion=5, comentario="Perfecto e impecable todo; La cabaña en excelentes condiciones, muy limpia y cómoda, con unas vistas preciosas, la atención amable de su dueña. El Achibueno es otra cosa, sus aguas MUY cristalinas, 10/10, volvería sin duda!")

        r1_b = Reserva.objects.create(cabana=c1, nombre_cliente="Francisca Fuentes Maturana", email_cliente="francisca@gmail.com", telefono_cliente="+56987654321", fecha_checkin=datetime.date(2026, 3, 23), fecha_checkout=datetime.date(2026, 3, 25), total_pago=Decimal("150000.00"), estado="pagada")
        Resena.objects.create(cabana=c1, reserva=r1_b, puntuacion=5, comentario="Excelente atención, todo muy limpio y lindo, cerca hay unos pozones preciosos.")

        r2_a = Reserva.objects.create(cabana=c2, nombre_cliente="Valeska Pesce", email_cliente="valeska@gmail.com", telefono_cliente="+56955554444", fecha_checkin=datetime.date(2026, 4, 17), fecha_checkout=datetime.date(2026, 4, 19), total_pago=Decimal("170000.00"), estado="pagada")
        Resena.objects.create(cabana=c2, reserva=r2_a, puntuacion=5, comentario="Es un lugar muy lindo, cómodo, tranquilo, las instalaciones perfectas, la atención 10 de 10. Los masajes espectaculares. Muy muy recomendable.")

        r2_b = Reserva.objects.create(cabana=c2, nombre_cliente="Jocsan Sanhueza Valdebenito", email_cliente="jocsan@gmail.com", telefono_cliente="+56933332222", fecha_checkin=datetime.date(2026, 5, 2), fecha_checkout=datetime.date(2026, 5, 4), total_pago=Decimal("170000.00"), estado="pagada")
        Resena.objects.create(cabana=c2, reserva=r2_b, puntuacion=5, comentario="Excelente estadía en Cabañas Aguapiedras. Lugar tranquilo, limpio y bien equipado, ideal para descansar. Destaca la buena atención y el entorno natural. Totalmente recomendado.")

        r3_a = Reserva.objects.create(cabana=c3, nombre_cliente="Mauricio Garcia", email_cliente="mauricio@gmail.com", telefono_cliente="+56966667777", fecha_checkin=datetime.date(2026, 5, 2), fecha_checkout=datetime.date(2026, 5, 4), total_pago=Decimal("190000.00"), estado="pagada")
        Resena.objects.create(cabana=c3, reserva=r3_a, puntuacion=5, comentario="Las cabañas con super detalles que hacen grata la estadía. Buenísima relación precio calidad, y la dueña siempre dispuesta a resolver las pretensiones de los clientes. Volveremos seguro !")

        r3_b = Reserva.objects.create(cabana=c3, nombre_cliente="Cata Noram", email_cliente="cata@gmail.com", telefono_cliente="+56988889999", fecha_checkin=datetime.date(2026, 4, 17), fecha_checkout=datetime.date(2026, 4, 19), total_pago=Decimal("190000.00"), estado="pagada")
        Resena.objects.create(cabana=c3, reserva=r3_b, puntuacion=5, comentario="Excelente servicio.. La anfitriona muy amable.. Todo muy limpio y la cabaña con calefacción a leña espectacular con el frío que nos toco.. 100% recomendable...")


        self.stdout.write('Poblando coordenadas de la ruta cordillerana...')
        # Coordenadas Ruta (Cajón del Achibueno)
        CoordenadaRuta.objects.create(
            orden=1,
            latitud=Decimal("-35.843600"),
            longitud=Decimal("-71.597900"),
            descripcion_hito="Linares (Punto de Partida): Abastecimiento final de víveres, combustible y provisiones."
        )
        CoordenadaRuta.objects.create(
            orden=2,
            latitud=Decimal("-35.918900"),
            longitud=Decimal("-71.378100"),
            descripcion_hito="Embalse Ancoa: Hermosa vista panorámica e inicio de la ruta precordillerana de tierra."
        )
        CoordenadaRuta.objects.create(
            orden=3,
            latitud=Decimal("-35.947200"),
            longitud=Decimal("-71.272100"),
            descripcion_hito="Pejerrey (Retén de Carabineros): Control obligatorio de seguridad y último punto con cobertura de telefonía móvil básica."
        )
        CoordenadaRuta.objects.create(
            orden=4,
            latitud=Decimal("-35.961000"),
            longitud=Decimal("-71.240500"),
            descripcion_hito="Llegada a Cabañas Aguapiedras: ¡Bienvenido! Tu cabaña cordillera junto al Río Achibueno te espera."
        )

        self.stdout.write('Creando superusuario de administración si no existe...')
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser('admin', 'admin@aguapiedras.cl', 'adminpassword123')
            self.stdout.write('Superusuario admin creado con contraseña: adminpassword123')
        else:
            self.stdout.write('El superusuario admin ya existía.')

        self.stdout.write('¡Base de datos de Aguapiedras poblada con éxito!')
