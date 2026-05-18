import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.css'
})
export class DetailComponent implements OnInit {

  cabana: any = null;
  loading: boolean = true;
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

  // Booking fields
  nombreCliente: string = '';
  emailCliente: string = '';
  telefonoCliente: string = '';

  // Extras variables
  extrasList: any[] = [];
  selectedExtras: { [key: number]: number } = {}; // extraId -> quantity
  totalPrice: number = 0;
  totalNoches: number = 0;

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      // 1. Fetch cabana details
      this.httpService.getCabana(id).subscribe({
        next: (data) => {
          this.cabana = data;
          this.calculateTotal();
          
          // 2. Fetch occupied dates
          this.httpService.getCabanaDisponibilidad(id).subscribe({
            next: (dates) => {
              this.occupiedDates = dates.map(d => ({
                checkin: new Date(d.checkin),
                checkout: new Date(d.checkout)
              }));
              this.generateCalendar();
              this.loading = false;
            },
            error: (err) => {
              console.error('Error fetching availability', err);
              this.loading = false;
            }
          });
        },
        error: (error) => {
          console.error('Error fetching cabana details', error);
          this.loading = false;
        }
      });

      // 3. Fetch extras list
      this.httpService.getExtras().subscribe({
        next: (data) => {
          this.extrasList = data;
          this.extrasList.forEach(e => {
            this.selectedExtras[e.id] = 0;
          });
        },
        error: (err) => console.error('Error fetching extras', err)
      });
    }
  }

  // Calendar generation
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
    
    // Empty slots before first day of the month
    for (let i = 0; i < firstDayIndex; i++) {
      this.days.push({ day: null, date: null, isOccupied: false, isSelected: false, isRange: false, isPast: false });
    }
    
    // Calendar days
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
    // Normalize today to midnight to compare only calendar days
    const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return date.getTime() <= todayNormalized;
  }

  checkIfOccupied(date: Date): boolean {
    const dTime = date.getTime();
    for (const range of this.occupiedDates) {
      // Normalize to midnight UTC/Local
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
        // Validate if there is any occupied day between checkin and checkout
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
          this.checkOutDate = selectedDate;
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

  // Real-time calculations
  toggleExtra(extraId: number, event: any) {
    const isChecked = event.target.checked;
    this.selectedExtras[extraId] = isChecked ? 1 : 0;
    this.calculateTotal();
  }

  updateExtraQty(extraId: number, qty: number) {
    this.selectedExtras[extraId] = qty;
    this.calculateTotal();
  }

  calculateTotal() {
    if (!this.cabana) return;
    
    if (this.checkInDate && this.checkOutDate) {
      const diffTime = Math.abs(this.checkOutDate.getTime() - this.checkInDate.getTime());
      this.totalNoches = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else {
      this.totalNoches = 0;
    }

    let total = parseFloat(this.cabana.precio_base) * this.totalNoches;

    // Calculate extras
    this.extrasList.forEach(extra => {
      const qty = this.selectedExtras[extra.id] || 0;
      if (qty > 0) {
        const price = parseFloat(extra.precio);
        if (extra.tipo === 'noche') {
          total += price * qty * this.totalNoches;
        } else { // estadia
          total += price * qty;
        }
      }
    });

    this.totalPrice = total;
  }

  // Reservation checkout
  confirmarPago() {
    if (!this.checkInDate || !this.checkOutDate) {
      alert('Por favor selecciona las fechas de Check-in y Check-out.');
      return;
    }
    if (!this.nombreCliente || !this.emailCliente || !this.telefonoCliente) {
      alert('Por favor completa todos tus datos de contacto.');
      return;
    }

    this.bookingLoading = true;

    // Format dates to YYYY-MM-DD
    const checkinStr = this.checkInDate.toISOString().split('T')[0];
    const checkoutStr = this.checkOutDate.toISOString().split('T')[0];

    const extrasReservados = Object.keys(this.selectedExtras)
      .map(key => ({ extra: parseInt(key), cantidad: this.selectedExtras[parseInt(key)] }))
      .filter(item => item.cantidad > 0);

    const reservaData = {
      cabana: this.cabana.id,
      nombre_cliente: this.nombreCliente,
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
        // Redirect to Mercado Pago checkout
        if (res.init_point) {
          window.location.href = res.init_point;
        } else {
          alert('Reserva creada con bloqueo temporal, pero no se pudo generar la pasarela de pago.');
        }
      },
      error: (err) => {
        this.bookingLoading = false;
        console.error('Error creating reservation', err);
        alert(err.error?.detail || 'Ocurrió un error al intentar crear tu reserva. Por favor intenta de nuevo.');
      }
    });
  }
}
