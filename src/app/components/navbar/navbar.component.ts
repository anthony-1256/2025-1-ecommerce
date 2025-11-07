/* ***** src/app/components/navbar/navbar.component.ts ***** */

import { Component } from '@angular/core';
import {  Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalStorageInfoComponent } from "../../pages/local-storage-info/local-storage-info.component";
import { SidebarComponent } from "../../pages/sidebar/sidebar.component";
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { ProductCategory } from '../../core/types/enums';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, LocalStorageInfoComponent, SidebarComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  /* ob: usuario actual */
  currentUser : User | null = null;

  /* ob: determinacion si el usuario es admin */
  isAdmin: boolean = false;

  /* ob: determina si hay usuario logueado */
  isLoggedIn: boolean = false;

  filteredProducts: Product[] = [];

  constructor( 
    private authService: AuthService,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe( user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.admin ?? false;
    });
  }

  /* mt: imagen del usuario actual segun su rol */
  get userImage(): string {
    if(!this.isLoggedIn) {
      return 'assets/images/logo-usr.jpg';
    }

    if(this.isAdmin) {

      /* admin principal con imagen estandar */
      if (this.currentUser?.username === 'admin') {
        return 'assets/images/logo-admin.jpg';
      }

      /* otros admins con imagen personalizada o fallback */
      return this.currentUser?.imgUser || 'assets/images/logo-admin.jpg';
    }

    /* usuario comun */
    return this.currentUser?.imgUser || 'assets/images/logo-usr.jpg';
  }

  /* mt: cerrar sesion y limpiar metodos locales */
  logout(): void {
    this.authService.logout();

    /* limpiar estados locales de inmediato */
    this.currentUser = null;
    this.isLoggedIn = false;
    this.isAdmin = false;

    /* redirigir pararefrescar navbar */
    this.router.navigate(['/inicioSesion'])
  }

  /* src/app/components/navbar/navbar.component.ts */
  onCategorySelected(category: string): void {
    // Filtrar productos usando tu método reactivo o no reactivo
    this.router.navigate(['/category'], { queryParams: { category } });
  }

  
  
}