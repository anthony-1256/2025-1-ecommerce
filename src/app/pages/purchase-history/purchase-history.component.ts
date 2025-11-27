/***** src/app/pages/purchase-history/purchase-history.ts *****/
import { Component, Input, OnInit } from '@angular/core';
import { Receipt } from '../../core/models/receipt.model';
import { PurchaseService } from '../../core/services/purchase.service';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CompanyInfoService } from '../../core/services/company-info.service';
import { CompanyInfo } from '../../core/models/company-info.model';
import { SalesService } from '../../core/services/sales.service';

/* import { PrintReceiptComponent } from '../print-receipt/print-receipt.component'; */

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [ CommonModule, RouterLink/* , PrintReceiptComponent */ ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css'
})
export class PurchaseHistoryComponent implements OnInit{  
  
  private _isOpen = false;
  selectedReceiptForModal: any = null;
  private storageListener?: (event: StorageEvent) => void;
  receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  companyData!: CompanyInfo;
  
  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router,
    private salesService: SalesService,
    private companyInfoService: CompanyInfoService
  ) {}
  
  /* mt: ngOnInit */  
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // Carga inicial
    this.receipts = this.purchaseService.getReceiptsByUser(user.idUser);
    this.companyData = this.companyInfoService.getCompanyData();

    // Actualizar cuando salesService emite cambios
    this.salesService.sales$.subscribe(() => {
      this.receipts = this.purchaseService.getReceiptsByUser(user.idUser);
    });
    
    this.storageListener = (event: StorageEvent) => {
      /* console.log('[storage] storageListener fired, event.key=', event.key); */
      this.receipts = this.purchaseService.getReceiptsByUser(user.idUser);
    }
    
    window.addEventListener('storage', this.storageListener);
  } /* fin ngOnInit */
  
  /* mt: ngOnDestroy */
  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener as EventListener);
    }
  } /* fin ngOnDestroy */

  /* mt: viewDetails */
  viewDetails(receipt: Receipt): void {
    /* console.log('VIEW DETAILS DISPARADO:', receipt); */
    this.selectedReceipt = receipt;
  } /* fin viewDetails */

  /* getter: fullAddress */
  get FullAddress(): string{
    const a = this.selectedReceipt?.deliveryAddress;
    return a
    ? `${a.street} #${a.number}, ${a.neighborhood}, C.P. ${a.postalCode}, ${a.city}, ${a.state}`: '';
  } /* fin fullAddress */
  
  /* getter: paymentSummary */
  get paymentSummary(): string {
    const p = this.selectedReceipt?.paymentMethod;
    return p
    ? `${p.alias} - ${p.bank} - ${p.method}` : '';
  } /* fin paymentSummary */
  
  /* getter: isOpen */
  get isOpen(): boolean {
    return this._isOpen;
  } /* fin isOpen */
  
  /* setter: isOpen */
  set isOpen(value: boolean) {
    /* console.log('[TRACE] isOpen cambiado a ->', value);
    console.trace(); */
    this._isOpen = value;
  } /* fin isOpen */
  
  /* mt: printNow */
  /* printNow(): void {
    if (!this.selectedReceipt) return;
    
    const width = 900;
    const height = 900;
    const left = window.screenX + (window.innerWidth - width) / 2;
    const top = window.screenY + (window.innerHeight - height) / 2;
    
    const url = `/imprimir/${this.selectedReceipt.idReceipt}`;    
    const htmlTicket = `Imprimiendo su Ticket. Espere por favor...`;

    const newWindow = window.open(
      url,
      '_blank',
      `width=${width}, height=${height}, left=${left}, top=${top}, scrollbars=yes,resizable=yes`
    );
    
    if (newWindow) {
      newWindow.document.body.innerHTML = htmlTicket ;
      newWindow.document.close();      
    }
  } */ /* fin printNow */

  // fn:downloadPdf
  downloadPdf(): void {
    if (!this.selectedReceipt) return;

    const id = this.selectedReceipt.idReceipt;

    const element = document.getElementById('receipt-content');
    if (!element) return;

    import('html2canvas').then(html2canvas => {
      html2canvas.default(element, {
        scale: 3,
        useCORS: true
      }).then(canvas => {

        const imgData = canvas.toDataURL('image/png');
        import('jspdf').then(jsPDF => {

          const pdf = new jsPDF.jsPDF('p', 'mm', 'a4');
          const pageWidth = pdf.internal.pageSize.getWidth();
          const pageHeight = pdf.internal.pageSize.getHeight();

          // Ajuste automático para que todo el ticket quepa en una sola página
          const pageW = pdf.internal.pageSize.getWidth() - 20;  
          const pageH = pdf.internal.pageSize.getHeight() - 20;

          let imgW = pageW;
          let imgH = (canvas.height * imgW) / canvas.width;

          // Si la imagen es más alta que la página → escalar proporcionalmente
          if (imgH > pageH) {
            const scale = pageH / imgH;
            imgW = imgW * scale;
            imgH = imgH * scale;
          }

          pdf.addImage(imgData, 'PNG', 10, 10, imgW, imgH);
          pdf.save(`ticket_${id}.pdf`);
        });
      });
    });
  } /* fin downloadPdf */

  /* mt: closeDetails */
  closeDetails(): void {
    this.selectedReceipt = null;
  } /* fin closeDetails */

  /* mt: goBack */
  goBack(): void {
    this.router.navigate(['/compras']); // o /products según lo que definas
  } /* fin goBack */

}
