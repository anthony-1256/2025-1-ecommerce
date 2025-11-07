/***** src/app/pages/purchase-history/purchase-history.ts *****/
import { Component, OnInit } from '@angular/core';
import { Receipt } from '../../core/models/receipt.model';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyInfoService } from '../../core/services/company-info.service';
import { CompanyInfo } from '../../core/models/company-info.model';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css'
})
export class PurchaseHistoryComponent implements OnInit{

  
  receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  companyData!: CompanyInfo;
  
  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router,
    private companyInfoService: CompanyInfoService
  ) {}
  
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.receipts = this.purchaseService.getReceiptsByUser(user.idUser);

      /* info de la empresa */
      this.companyData = this.companyInfoService.getCompanyData();
    }
  }

  viewDetails(receipt: Receipt): void {
    this.selectedReceipt = receipt;
  }

  get FullAddress(): string{
    const a = this.selectedReceipt?.deliveryAddress;
    return a
    ? `${a.street} #${a.number}, ${a.neighborhood}, C.P. ${a.postalCode}, ${a.city}, ${a.state}`: '';
  }

  get paymentSummary(): string {
    const p = this.selectedReceipt?.paymentMethod;
    return p
    ? `${p.alias} - ${p.bank} - ${p.method}` : '';
  }

  /* mt: imprimir recibo actual */
  printCurrentReceipt(): void {
    if (!this.selectedReceipt) return;    

    const printWindow = window.open('', '', 'width=600, height= 800');
    if (!printWindow) return;

    /* creacion de estructura basica de html */
    const html = document.createElement('html');
    const head = document.createElement('head');
    const body = document.createElement('body');

    /* Titulo del reibo */
    const title = printWindow.document.createElement('title');
    title.innerText = 'Recibo de compra';
    head.appendChild(title);

    // Estilos básicos (puedes extraer esto a un archivo externo si prefieres)
    const style = printWindow.document.createElement('style');
    style.textContent = `
      body {
        font-family: Arial, sans-serif;
        margin: 20px;
        font-size: 12px;
      }

      .screen-only {
        max-width: 325px;
        margin: auto;
      }

      @media print {
        .screen-only {
          max-width: 100% !important;
        }

        .table {
          width: 100% !important;
          font-size: 11px;
          border-collapse: collapse;
        }

        .table th, .table td {
          border: 1px solid #ccc;
          padding: 6px;
          text-align: center;
        }

        h3, h6 {
          margin: 4px 0;
          text-align: center;
        }

        ul {
          list-style: none;
          padding: 0;
          text-align: center;
        }

        ul li {
          margin: 4px 0;
        }
      }
    `;
    head.appendChild(style);

    /* Contenido del recibo */
    const content = printWindow.document.createElement('div');
    content.innerHTML = document.getElementById('receipt-content')?.innerHTML || '';

    body.appendChild(content);
    html.appendChild(head);
    html.appendChild(body);

    /* Reemplazar el contenido del nuevo documento */
    printWindow.document.documentElement.replaceWith(html);

    /* Esperar carga y lanzar impresión */
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }

  closeDetails(): void {
    this.selectedReceipt = null;
  }

  goBack(): void {
    this.router.navigate(['/compras']); // o /products según lo que definas
  }

}
