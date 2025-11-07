/***** src/app/pages/profiles/profile/profile.component.ts *****/

import { Component } from '@angular/core';
import { User } from '../../../core/models/user.model';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Alias de tipo para las secciones
type Section = 'personalData' | 'addresses' | 'paymentMethods' | 'purchaseHistory' | 'currentCart' | 'favorites';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent {

  currentUser: User | null = null;

  // Sección activa inicial, con type assertion para evitar error en template
  activeSection: Section = 'personalData' as Section;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
  }

  // Cambiar sección activa
  setActiveSection(section: Section): void {
    this.activeSection = section;
  }

  // Método para editar foto (temporal)
  onEditPhoto(): void {
    console.log('Lógica para cambiar la foto de perfil');
  }  
}
