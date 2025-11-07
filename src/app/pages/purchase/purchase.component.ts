import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './purchase.component.html',
  styleUrl: './purchase.component.css'
})
export class PurchaseComponent {

  /* mt: redirecionar a historial de compras */
  goToHistory(): void {
    window.location.href = '/historial de compras';
  }

  /* mt: redireccionar a la tienda */
  continueShopping(): void {
    window.location.href = '/productos';
  }

  /* mt: redireccionar al perfil de usuario */
  goToProfile(): void {
    window.location.href = '/perfilAdmin';
  }

}