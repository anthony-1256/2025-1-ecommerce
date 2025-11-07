/***** src/app/pages/profiles/admin-profile/admin-profile.component.ts *****/

import { Component } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Alias de tipo para las secciones
type Section = 'personalData' | 'addresses' | 'paymentMethods' | 'purchaseHistory' | 'currentCart' | 'favorites';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './admin-profile.component.html',
  styleUrl: './admin-profile.component.css'  // ✅ plural
})
export class AdminProfileComponent {

  currentUser: User | null = null;

  // Sección activa inicial con type assertion
  activeSection: Section = 'personalData' as Section;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  // Cambiar sección activa
  setActiveSection(section: Section): void {
    this.activeSection = section;
  }

  // Método provisional para editar foto
  onEditPhoto(): void {
    console.log('Lógica para cambiar la foto de perfil');
  }

}
