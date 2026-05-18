import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpService } from '../../services/http.service';
import * as L from 'leaflet';

@Component({
  selector: 'app-route-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-map.component.html',
  styleUrl: './route-map.component.css'
})
export class RouteMapComponent implements OnInit, AfterViewInit, OnDestroy {

  private map!: L.Map;
  hitos: any[] = [];
  loading = true;

  constructor(private httpService: HttpService) { }

  ngOnInit(): void {
    this.httpService.getRuta().subscribe({
      next: (data) => {
        this.hitos = data;
        this.loading = false;
        this.drawRoute();
      },
      error: (err) => {
        console.error('Error fetching route hitos', err);
        this.loading = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    // Default center to Linares / Cajon del Achibueno area
    this.map = L.map('map', {
      center: [-35.95, -71.25],
      zoom: 12
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Leaflet icon bug workaround in Angular
    const iconRetinaUrl = 'assets/marker-icon-2x.png';
    const iconUrl = 'assets/marker-icon.png';
    const shadowUrl = 'assets/marker-shadow.png';
    const iconDefault = L.icon({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      tooltipAnchor: [16, -28],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = iconDefault;
  }

  private drawRoute(): void {
    if (!this.map || this.hitos.length === 0) return;

    const coordinates: L.LatLngExpression[] = [];

    this.hitos.forEach(h => {
      const lat = parseFloat(h.latitud);
      const lng = parseFloat(h.longitud);
      const latlng: L.LatLngExpression = [lat, lng];
      coordinates.push(latlng);

      // Create a marker for each hito
      L.marker(latlng)
        .addTo(this.map)
        .bindPopup(`<b>Hito ${h.orden}</b><br>${h.descripcion_hito}`);
    });

    // Draw the polyline route
    const polyline = L.polyline(coordinates, {
      color: '#1b5e20',
      weight: 5,
      opacity: 0.8,
      dashArray: '10, 10'
    }).addTo(this.map);

    // Fit map view bounds around the route polyline
    this.map.fitBounds(polyline.getBounds());
  }

  downloadPDF() {
    window.open('http://localhost:8000/api/ruta/pdf/', '_blank');
  }
}
