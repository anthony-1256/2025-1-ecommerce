/* navbar.component.ts */
import { Component, OnInit } from '@angular/core';
import {  Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, AuthenticatedUser } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../../core/models/product.model';
import * as bootstrap from 'bootstrap';
import { LocalStorageInfoComponent } from '../../../pages/utilities/local-storage-info/local-storage-info.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    CommonModule,
    FormsModule,
    LocalStorageInfoComponent,
    SidebarComponent
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  
  currentUser : AuthenticatedUser | null = null;  
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  filteredProducts: Product[] = [];

  constructor( 
    private authService: AuthService,
    private router: Router,    
  ) {
    const temaGuardado = localStorage.getItem('tema');
    if (temaGuardado){
      document.documentElement.setAttribute('data-bs-theme', temaGuardado);
    }
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe( user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
    });
  } /* end ngOnInit */
  
  ngAfterViewInit(): void {
    const dropdownElements = document.querySelectorAll('.dropdown-toggle');
    dropdownElements.forEach((el) => new bootstrap.Dropdown(el));
  } /* end ngAfterViewInit */
  
  get userImage(): string {
    if(!this.isLoggedIn) {
      return 'assets/images/logo-usr.jpg';
    }

    if(this.isAdmin) {

      if (this.currentUser?.role === 'admin') {
        return 'assets/images/logo-admin.jpg';
      }

      return 'assets/images/logo-admin.jpg';
    }
    
    return 'assets/images/logo-usr.jpg';
  } /* end ngAfterViewInit */

  logout(): void {
    this.authService.logout();
  
    this.currentUser = null;
    this.isLoggedIn = false;
    this.isAdmin = false;
    
    this.router.navigate(['/inicioSesion'])
  } /* end logout */
  
  onCategorySelected(category: string): void {    
    this.router.navigate(['/category'], { queryParams: { category } });
  } /* end onCategorySelected */
  
  public cambiarTema(mode: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-bs-theme', mode);
    localStorage.setItem('tema', mode);
  } /* end cambiarTema */
  
} /* end NavbarComponent */