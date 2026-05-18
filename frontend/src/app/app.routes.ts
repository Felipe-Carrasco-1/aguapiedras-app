import { Routes } from '@angular/router';
import { CatalogComponent } from './components/catalog/catalog.component';
import { DetailComponent } from './components/detail/detail.component';
import { RouteMapComponent } from './components/route-map/route-map.component';
import { PromosComponent } from './components/promos/promos.component';
import { AdminLoginComponent } from './components/admin-login/admin-login.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'cabanas', component: CatalogComponent },
  { path: 'cabanas/:id', component: DetailComponent },
  { path: 'ruta', component: RouteMapComponent },
  { path: 'promociones', component: PromosComponent },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [authGuard] },
  { path: '', redirectTo: '/cabanas', pathMatch: 'full' }
];
