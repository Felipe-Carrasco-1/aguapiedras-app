import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.css'
})
export class CatalogComponent implements OnInit {

  cabanas: any[] = [];
  showSuccessAlert = false;
  reservaId: string | null = null;

  constructor(
    private httpService: HttpService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // 1. Listen for mock success redirection
    this.route.queryParams.subscribe(params => {
      if (params['payment_mock_success'] === 'true') {
        this.showSuccessAlert = true;
        this.reservaId = params['reserva_id'];
      }
    });

    // 2. Fetch cabins
    this.httpService.getCabanas().subscribe({
      next: (data) => {
        this.cabanas = data;
      },
      error: (error) => {
        console.error('Error fetching cabanas', error);
      }
    });
  }

  closeAlert() {
    this.showSuccessAlert = false;
  }
}
