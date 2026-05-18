import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpService } from '../../services/http.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {

  cabanas: any[] = [];
  reservas: any[] = [];
  extras: any[] = [];
  loading = true;

  // Manual block fields
  selectedCabanaId: number | null = null;
  blockCheckIn = '';
  blockCheckOut = '';
  blockReason = '';
  blockLoading = false;

  // Price fields
  priceCabanaId: number | null = null;
  newPrice: number | null = null;
  priceLoading = false;

  // Extra/Service fields
  selectedExtraId: number | null = null;
  newExtraPrice: number | null = null;
  newExtraDescription = '';
  extraLoading = false;

  constructor(
    private httpService: HttpService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.httpService.getCabanas().subscribe({
      next: (cabanas) => {
        this.cabanas = cabanas;
        this.httpService.getAllReservas().subscribe({
          next: (reservas) => {
            this.reservas = reservas;
            this.httpService.getExtras().subscribe({
              next: (extras) => {
                this.extras = extras;
                this.loading = false;
              },
              error: (err) => {
                console.error('Error fetching extras', err);
                this.loading = false;
              }
            });
          },
          error: (err) => {
            console.error('Error fetching reservations', err);
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error fetching cabanas', err);
        this.loading = false;
      }
    });
  }

  onSelectExtra(extra: any) {
    this.selectedExtraId = extra.id;
    this.newExtraPrice = parseFloat(extra.precio);
    this.newExtraDescription = extra.descripcion;
  }

  onSelectExtraById() {
    const extra = this.extras.find(ex => ex.id === this.selectedExtraId);
    if (extra) {
      this.newExtraPrice = parseFloat(extra.precio);
      this.newExtraDescription = extra.descripcion;
    } else {
      this.newExtraPrice = null;
      this.newExtraDescription = '';
    }
  }

  onUpdateExtra(): void {
    if (!this.selectedExtraId || this.newExtraPrice === null || this.newExtraPrice < 0) {
      alert('Por favor selecciona un servicio y un precio válido.');
      return;
    }

    this.extraLoading = true;
    const updateData = {
      precio: this.newExtraPrice,
      descripcion: this.newExtraDescription
    };

    this.httpService.updateExtra(this.selectedExtraId, updateData).subscribe({
      next: () => {
        this.extraLoading = false;
        alert('Servicio adicional actualizado correctamente.');
        this.selectedExtraId = null;
        this.newExtraPrice = null;
        this.newExtraDescription = '';
        this.loadData();
      },
      error: (err) => {
        this.extraLoading = false;
        console.error('Error updating extra', err);
        alert('No se pudo actualizar el servicio adicional.');
      }
    });
  }

  // Create manual block
  onBlock(): void {
    if (!this.selectedCabanaId || !this.blockCheckIn || !this.blockCheckOut || !this.blockReason) {
      alert('Por favor completa todos los campos para el bloqueo manual.');
      return;
    }

    this.blockLoading = true;
    const blockData = {
      cabana: this.selectedCabanaId,
      nombre_cliente: 'Bloqueo Manual (Admin)',
      email_cliente: 'admin@aguapiedras.cl',
      telefono_cliente: '999999999',
      fecha_checkin: this.blockCheckIn,
      fecha_checkout: this.blockCheckOut,
      total_pago: 0,
      estado: 'mantenimiento' // Note: Backend serializer handles estado but let's pass it
    };

    this.httpService.createManualBlock(blockData).subscribe({
      next: () => {
        this.blockLoading = false;
        alert('Bloqueo por mantenimiento creado con éxito.');
        this.blockCheckIn = '';
        this.blockCheckOut = '';
        this.blockReason = '';
        this.loadData(); // Refresh list
      },
      error: (err) => {
        this.blockLoading = false;
        console.error('Error creating block', err);
        alert(err.error?.detail || 'No se pudo realizar el bloqueo. Revisa si hay sobreposición de fechas.');
      }
    });
  }

  // Change cabin price
  onUpdatePrice(): void {
    if (!this.priceCabanaId || this.newPrice === null || this.newPrice <= 0) {
      alert('Por favor selecciona una cabaña y un precio válido.');
      return;
    }

    this.priceLoading = true;
    this.httpService.updateCabanaPrice(this.priceCabanaId, this.newPrice).subscribe({
      next: () => {
        this.priceLoading = false;
        alert('Tarifa actualizada correctamente.');
        this.newPrice = null;
        this.priceCabanaId = null;
        this.loadData();
      },
      error: (err) => {
        this.priceLoading = false;
        console.error('Error updating price', err);
        alert('No se pudo actualizar la tarifa.');
      }
    });
  }

  // Select cabin to edit price
  selectCabanaForPrice(cabana: any) {
    this.priceCabanaId = cabana.id;
    this.newPrice = parseFloat(cabana.precio_base);
  }

  // Get reservations of a specific cabin
  getCabanaReservas(cabanaId: number): any[] {
    return this.reservas.filter(r => r.cabana === cabanaId);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/admin/login']);
  }
}
