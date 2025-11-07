/***** src/app/pages/confirmation/confirmation.component.ts *****/

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Receipt } from '../../core/models/receipt.model';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {

  /* ob: ultimo recibo generado */
  public lastReceipt!: Receipt | null;

  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) return;

    const receipts = this.purchaseService.getReceiptsByUser(currentUser.idUser);
    if (receipts.length > 0) {
      this.lastReceipt = receipts.at(-1)!;
    }
  }

  
  /* mt: navegación a historial de compras */
  goToHistory(): void {
    this.router.navigate(['/historial de compras']);
  }

  /* mt: navegación a productos */
  gotoProducts(): void {
    this.router.navigate(['/productos']);
  }


  /* mt: navegación a perfil */
  goToProfile(): void {
    this.router.navigate(['/perfilAdmin']);
  }

  /* mt: descargar recibo (PDF) */
  downloadPdf(): void {
    alert('funcionalidad de descarga de PDF en desarrollo');
  }

}
