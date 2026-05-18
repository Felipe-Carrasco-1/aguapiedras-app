import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-promos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './promos.component.html',
  styleUrl: './promos.component.css'
})
export class PromosComponent implements OnInit {

  // Catalog of promotions
  promos = [
    {
      id: 'chicas',
      titulo: 'Noche de Chicas',
      emoji: '👯‍♀️',
      tagline: 'Desconexión total con tus mejores amigas',
      descripcion: 'Regálate una escapada con amigas y disfruten de un momento de relajo y conexión. La experiencia incluye alojamiento en una cabaña acogedora, una tabla gourmet de picoteo local, tragos de bienvenida, sesión privada en nuestra tinaja caliente a leña y masajes tailandeses de 30 minutos.',
      minNoches: 1,
      maxNoches: 1,
      extrasIncluidos: ['tinaja', '30 min', 'desayuno'],
      detallesList: [
        'Alojamiento premium en la cabaña de tu elección.',
        'Sesión privada de tinaja de agua caliente templada a leña.',
        'Tabla gourmet de quesos y picoteo local + trago de bienvenida.',
        'Masaje tailandés tradicional de 30 minutos para cada integrante.',
        'Desayuno artesanal cordillerano en canasta servido por la mañana.'
      ],
      color: 'var(--moss-green)',
      destacado: true
    },
    {
      id: 'romantica',
      titulo: 'Escapada Romántica',
      emoji: '💖',
      tagline: 'Sorprende a tu pareja en medio del bosque nativo',
      descripcion: 'El escenario perfecto para desconectarse del mundo y volver a conectar en pareja. Disfruten del aire puro y el murmullo del río con tinaja caliente privada bajo el cielo estrellado y masajes profesionales tailandeses.',
      minNoches: 1,
      maxNoches: 2,
      extrasIncluidos: ['tinaja', '60 min', 'desayuno'],
      detallesList: [
        'Alojamiento íntimo en cabaña premium con calefacción a leña.',
        'Acceso privado a tinaja caliente bajo las estrellas.',
        'Tabla especial de picoteo y maridaje de bienvenida.',
        'Sesión completa de masaje tailandés tradicional de 60 minutos.',
        'Delicioso desayuno de campo llevado a la puerta de tu cabaña.',
        'Válido para estadías de 1 o 2 noches.'
      ],
      color: 'var(--accent-gold)',
      destacado: false
    },
    {
      id: 'cumpleanos',
      titulo: 'Cumpleaños Sorpresa',
      emoji: '🎉',
      tagline: 'Celebra un día especial en un entorno único',
      descripcion: 'Sorprende a esa persona especial con un cumpleaños inolvidable en medio de la naturaleza del Achibueno. Nosotros nos encargamos de ambientar todo con torta de celebración artesanal, espumante y detalles especiales.',
      minNoches: 1,
      maxNoches: 2,
      extrasIncluidos: ['tinaja', 'repostería'],
      detallesList: [
        'Cabaña decorada de forma especial para la celebración.',
        'Exquisita torta de cumpleaños artesanal de elaboración local.',
        'Tabla gourmet de picoteo y botella de espumante para brindar.',
        'Acceso privado a tinaja caliente templada a leña.',
        'Detalle/regalo sorpresa exclusivo de Cabañas Aguapiedras.'
      ],
      color: 'var(--wood-warm)',
      destacado: false
    }
  ];

  selectedPromo = this.promos[0];
  cabanasList: any[] = [];
  selectedCabana: any = null;
  extrasList: any[] = [];
  loadingCabanas: boolean = true;
  loadingDispo: boolean = false;
  bookingLoading: boolean = false;

  // Calendar variables
  currentDate = new Date();
  currentMonth = this.currentDate.getMonth();
  currentYear = this.currentDate.getFullYear();
  months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  days: any[] = [];
  
  checkInDate: Date | null = null;
  checkOutDate: Date | null = null;
  occupiedDates: any[] = [];

  // Client info
  nombreCliente: string = '';
  emailCliente: string = '';
  telefonoCliente: string = '';

  // Pricing calculations
  totalNoches: number = 0;
  totalPrice: number = 0;

  constructor(private httpService: HttpService) {}

  ngOnInit(): void {
    // 1. Fetch active cabins
    this.httpService.getCabanas().subscribe({
      next: (data) => {
        this.cabanasList = data;
        if (this.cabanasList.length > 0) {
          this.onSelectCabana(this.cabanasList[0]);
        }
        this.loadingCabanas = false;
      },
      error: (err) => {
        console.error('Error fetching cabanas', err);
        this.loadingCabanas = false;
      }
    });

    // 2. Fetch extras database to map them by name
    this.httpService.getExtras().subscribe({
      next: (data) => {
        this.extrasList = data;
      },
      error: (err) => console.error('Error loading extras list', err)
    });
  }

  onSelectPromo(promo: any) {
    this.selectedPromo = promo;
    // Clear selections to re-evaluate based on the new promo restrictions
    this.checkInDate = null;
    this.checkOutDate = null;
    this.totalNoches = 0;
    this.calculateTotal();
    this.generateCalendar();
  }

  onSelectCabana(cabana: any) {
    this.selectedCabana = cabana;
    this.checkInDate = null;
    this.checkOutDate = null;
    this.totalNoches = 0;
    this.calculateTotal();
    this.loadingDispo = true;

    // Fetch availability for this specific cabin
    this.httpService.getCabanaDisponibilidad(cabana.id).subscribe({
      next: (dates) => {
        this.occupiedDates = dates.map(d => ({
          checkin: new Date(d.checkin),
          checkout: new Date(d.checkout)
        }));
        this.generateCalendar();
        this.loadingDispo = false;
      },
      error: (err) => {
        console.error('Error fetching disponibilidad', err);
        this.loadingDispo = false;
      }
    });
  }

  // Calendar logic
  prevMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  generateCalendar() {
    this.days = [];
    const firstDayIndex = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    
    for (let i = 0; i < firstDayIndex; i++) {
      this.days.push({ day: null, date: null, isOccupied: false, isSelected: false, isRange: false, isPast: false });
    }
    
    for (let d = 1; d <= lastDay; d++) {
      const dateObj = new Date(this.currentYear, this.currentMonth, d);
      const isOccupied = this.checkIfOccupied(dateObj);
      const isPast = this.checkIfPast(dateObj);
      this.days.push({
        day: d,
        date: dateObj,
        isOccupied: isOccupied,
        isPast: isPast,
        isSelected: this.isDaySelected(dateObj),
        isRange: this.isDayInRange(dateObj)
      });
    }
  }

  checkIfPast(date: Date): boolean {
    const today = new Date();
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return date.getTime() <= todayNormalized;
  }

  checkIfOccupied(date: Date): boolean {
    const dTime = date.getTime();
    for (const range of this.occupiedDates) {
      const start = new Date(range.checkin.getFullYear(), range.checkin.getMonth(), range.checkin.getDate()).getTime();
      const end = new Date(range.checkout.getFullYear(), range.checkout.getMonth(), range.checkout.getDate()).getTime();
      if (dTime >= start && dTime < end) {
        return true;
      }
    }
    return false;
  }

  isDaySelected(date: Date): boolean {
    if (this.checkInDate && date.getTime() === this.checkInDate.getTime()) return true;
    if (this.checkOutDate && date.getTime() === this.checkOutDate.getTime()) return true;
    return false;
  }

  isDayInRange(date: Date): boolean {
    if (this.checkInDate && this.checkOutDate) {
      const dTime = date.getTime();
      return dTime > this.checkInDate.getTime() && dTime < this.checkOutDate.getTime();
    }
    return false;
  }

  selectDay(dayObj: any) {
    if (!dayObj.date || dayObj.isOccupied || dayObj.isPast) return;
    
    const selectedDate = dayObj.date;

    if (!this.checkInDate || (this.checkInDate && this.checkOutDate)) {
      this.checkInDate = selectedDate;
      this.checkOutDate = null;
    } else if (this.checkInDate && !this.checkOutDate) {
      if (selectedDate < this.checkInDate) {
        this.checkInDate = selectedDate;
      } else {
        // Validate occupied middle days
        let hasOccupied = false;
        let temp = new Date(this.checkInDate.getTime());
        while (temp < selectedDate) {
          if (this.checkIfOccupied(temp)) {
            hasOccupied = true;
            break;
          }
          temp.setDate(temp.getDate() + 1);
        }
        
        if (hasOccupied) {
          alert('El rango seleccionado contiene fechas ocupadas. Elige otro rango.');
          this.checkInDate = selectedDate;
        } else {
          // Validate Promo nights restrictions
          const diffTime = Math.abs(selectedDate.getTime() - this.checkInDate.getTime());
          const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          const min = this.selectedPromo.minNoches;
          const max = this.selectedPromo.maxNoches;

          if (nights < min || nights > max) {
            if (min === max) {
              alert(`La promoción "${this.selectedPromo.titulo}" es exclusiva para exactamente ${min} noche(s). Por favor selecciona un rango de esa duración.`);
            } else {
              alert(`La promoción "${this.selectedPromo.titulo}" es válida para estadías de entre ${min} y ${max} noches. Por favor reajusta tus fechas.`);
            }
            // Reset selection to check-in only
            this.checkInDate = selectedDate;
            this.checkOutDate = null;
          } else {
            this.checkOutDate = selectedDate;
          }
        }
      }
    }
    this.updateCalendarSelections();
    this.calculateTotal();
  }

  updateCalendarSelections() {
    this.days.forEach(day => {
      if (day.date) {
        day.isSelected = this.isDaySelected(day.date);
        day.isRange = this.isDayInRange(day.date);
      }
    });
  }

  calculateTotal() {
    if (!this.selectedCabana) return;
    
    if (this.checkInDate && this.checkOutDate) {
      const diffTime = Math.abs(this.checkOutDate.getTime() - this.checkInDate.getTime());
      this.totalNoches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      this.totalNoches = 0;
    }

    // Cost: Cabin Base Price * selected nights
    this.totalPrice = parseFloat(this.selectedCabana.precio_base) * this.totalNoches;
  }

  // Submit reservation
  confirmarReservaPromocion() {
    if (!this.selectedCabana) {
      alert('Por favor selecciona una cabaña.');
      return;
    }
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Por favor selecciona un rango válido de fechas en el calendario.');
      return;
    }
    if (!this.nombreCliente || !this.emailCliente || !this.telefonoCliente) {
      alert('Por favor completa todos tus datos de contacto.');
      return;
    }

    this.bookingLoading = true;

    // Mapping dynamic extras automatically from the database list based on name matching
    const extrasReservados: any[] = [];
    this.selectedPromo.extrasIncluidos.forEach(keyword => {
      const dbExtra = this.extrasList.find(extra => 
        extra.nombre.toLowerCase().includes(keyword.toLowerCase())
      );
      if (dbExtra) {
        extrasReservados.push({
          extra: dbExtra.id,
          cantidad: 1 // Automatically booking 1 unit of this promo included extra
        });
      }
    });

    const checkinStr = this.checkInDate.toISOString().split('T')[0];
    const checkoutStr = this.checkOutDate.toISOString().split('T')[0];

    const reservaData = {
      cabana: this.selectedCabana.id,
      nombre_cliente: `${this.nombreCliente} (${this.selectedPromo.titulo})`, // Flag in name to let staff know it's a promo
      email_cliente: this.emailCliente,
      telefono_cliente: this.telefonoCliente,
      fecha_checkin: checkinStr,
      fecha_checkout: checkoutStr,
      total_pago: this.totalPrice,
      extras_reservados: extrasReservados
    };

    this.httpService.createReserva(reservaData).subscribe({
      next: (res) => {
        this.bookingLoading = false;
        if (res.init_point) {
          window.location.href = res.init_point;
        } else {
          alert('Promoción agendada con éxito, pero no se pudo iniciar Mercado Pago.');
        }
      },
      error: (err) => {
        this.bookingLoading = false;
        console.error('Error creating promo reservation', err);
        alert(err.error?.detail || 'Ocurrió un error al procesar tu reserva de promoción.');
      }
    });
  }
}
