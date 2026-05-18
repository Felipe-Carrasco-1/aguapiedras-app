import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  private apiUrl = 'http://localhost:8000/api';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getCabanas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cabanas/`);
  }

  getCabana(id: string | null): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/cabanas/${id}/`);
  }

  getCabanaDisponibilidad(id: string | null): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/cabanas/${id}/disponibilidad/`);
  }

  getExtras(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/extras/`);
  }

  createReserva(reserva: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reservas/`, reserva);
  }

  getAllReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reservas/`, { headers: this.getHeaders() });
  }

  updateCabanaPrice(id: number, price: number): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/cabanas/${id}/`, { precio_base: price }, { headers: this.getHeaders() });
  }

  updateExtra(id: number, extraData: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/extras/${id}/`, extraData, { headers: this.getHeaders() });
  }

  createManualBlock(blockData: any): Observable<any> {
    // Admin creates reservation with status 'mantenimiento'
    return this.http.post<any>(`${this.apiUrl}/reservas/`, blockData, { headers: this.getHeaders() });
  }

  getRuta(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/ruta/`);
  }
}
