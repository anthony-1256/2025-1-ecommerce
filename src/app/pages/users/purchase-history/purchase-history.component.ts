/* purchase-history.ts */
import { Component,  OnInit } from '@angular/core';
import { Receipt } from '../../../core/models/receipt.model';

import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

import { CompanyInfo } from '../../../core/models/company-info.model';
import { Product } from '../../../core/models/product.model';
import { PurchaseService } from '../../../core/services/purchase.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-purchase-history',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './purchase-history.component.html',
  styleUrl: './purchase-history.component.css'
})
export class PurchaseHistoryComponent implements OnInit{  
  
  private _isOpen = false;
  selectedReceiptForModal: Receipt | null = null;
  private storageListener?: (event: StorageEvent) => void;
  receipts: Receipt[] = [];
  selectedReceipt: Receipt | null = null;
  companyData!: CompanyInfo;
  public offers: Product[] = [];
  public beforeLastPrice: Record< string, number > = {};
  public hasDiscountMap: { [id: string]: boolean } = {};
  
  constructor(
    private purchaseService: PurchaseService,
    private authService: AuthService,
    private router: Router,    
  ) {}  
  
  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.receipts = this.purchaseService.getReceiptsByUser(Number(user._id));

    this.receipts.forEach(r =>
      r.items.forEach(i => {

        const id = i.product._id ?? '';

        if ( !id ) return;
        
        this.beforeLastPrice[id] =  0;
        this.hasDiscountMap[id] = false;

      })
    );
    
    this.storageListener = (event: StorageEvent) => {
      /* console.log('[storage] storageListener fired, event.key=', event.key); */
      this.receipts = this.purchaseService.getReceiptsByUser(Number(user._id));
    }
    
    window.addEventListener('storage', this.storageListener);
  } /* end ngOnInit */
  
  getBeforeLastPrice(): typeof this.beforeLastPrice {
    return this.beforeLastPrice;
  } /* end getBeforeLastPrice */

  getDiscountPercentage(id: string, current: number): number {
    const prev = this.beforeLastPrice[id];
    if (!prev || prev <= 0 ) return 0;

    const discount = ((prev - current) / prev) * 100;
    return Number(discount.toFixed(2));
  }; /* end getDiscountPercentage */  
  
  ngOnDestroy(): void {
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener as EventListener);
    }
  } /* end ngOnDestroy */
  
  viewDetails(receipt: Receipt): void {
    /* console.log('VIEW DETAILS DISPARADO:', receipt); */
    this.selectedReceipt = receipt;
  } /* end viewDetails */
  
  get FullAddress(): string{
    const a = this.selectedReceipt?.deliveryAddress;
    return a
    ? `${a.street} #${a.number}, ${a.neighborhood}, C.P. ${a.postalCode}, ${a.city}, ${a.state}`: '';
  } /* end fullAddress */  
  
  get paymentSummary(): string {
    
    const p = this.selectedReceipt?.paymentMethod;
    
    if (!p) return '';
    
    return `${p.type} - ${p.bankName ?? ''} - ${p.accountNumber ?? ''}`;
    
  } /* end paymentSummary */  
  
  get isOpen(): boolean {
    return this._isOpen;
  } /* end isOpen */  
  
  set isOpen(value: boolean) {
    /* console.log('[TRACE] isOpen cambiado a ->', value);
    console.trace(); */
    this._isOpen = value;
  } /* end isOpen */
  
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
  } /* end downloadPdf */
  
  closeDetails(): void {
    this.selectedReceipt = null;
  } /* end closeDetails */
  
  goBack(): void {
    this.router.navigate(['/compras']); // o /products según lo que definas
  } /* end goBack */

} /* end  */