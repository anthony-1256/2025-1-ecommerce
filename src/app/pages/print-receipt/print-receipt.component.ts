import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { Receipt } from '../../core/models/receipt.model';
import { ActivatedRoute } from '@angular/router';
import { PurchaseService } from '../../core/services/purchase.service';

@Component({
  selector: 'app-print-receipt',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './print-receipt.component.html',
  styleUrl: './print-receipt.component.css'
})
export class PrintReceiptComponent {
  
    @Input() receipt: Receipt | null = null;  

  
  selectedReceipt: Receipt | null = null;
  companyData: any = {};

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private purchaseService: PurchaseService
  ) {}
  
  /* mt: ngOnInit */
  ngOnInit(): void {
    console.log('[PrintReceiptComponent] ngOnInit, receipt=', this.receipt);
    console.trace();

    
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const receipts = this.purchaseService.getReceiptsByUser(user.idUser) || [];
        this.selectedReceipt = receipts.find(r => r.idReceipt == idParam) || null;        
        this.companyData = this.selectedReceipt?.companyInfo ?? {};
      }
    } else {
      this.selectedReceipt = this.receipt;
      this.companyData = this.selectedReceipt?.companyInfo ?? {};
    }
    
    
    const closeWindow = () => {
      try {

        setTimeout(() => window.close(), 50);
      } catch (e) {
        console.warn('closeWindow fallo', e);
      }
    };

     // fallback timer: si por alguna razón ningún evento se dispara, cerramos en X ms
    const fallbackTimer = window.setTimeout(() => {
      console.warn('fallback: cerrando ventana de impresión');
      closeWindow();
    }, 6000); // 6s — ajustable

    // handler que limpia fallback y cierra
    const afterPrintHandler = () => {
      window.clearTimeout(fallbackTimer);
      try { window.removeEventListener('afterprint', afterPrintHandler); } catch {}
      // matchMedia listener cleanup (se agrega abajo si aplica)
      closeWindow();
    };

    // registrar onafterprint si está disponible
    try {
      window.addEventListener('afterprint', afterPrintHandler);
    } catch (e) {
      // algunos entornos usan window.onafterprint
      // @ts-ignore
      window.onafterprint = afterPrintHandler;
    }

    // media query fallback (algunos navegadores compat)
    let mq: MediaQueryList | null = null;
    if ('matchMedia' in window) {
      mq = window.matchMedia('print');

      const mqListener = (m: MediaQueryListEvent) => {
        if (m.matches === false ) {
          window.clearTimeout(fallbackTimer);
          closeWindow();
          try { mq?.removeEventListener('change', mqListener); } catch {}
        }
      };

      mq.addEventListener('change', mqListener);
    }

    // forzamos pequeño delay para asegurar render y focus antes de imprimir
    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (e) {
        console.warn('print fallo', e);
        // si falla, cerramos con fallback inmediato
        window.clearTimeout(fallbackTimer);
        closeWindow();
      }
    }, 250);
  } /* fin ngOnInit */

  ngOnChanges(): void {
    console.log('[PrintReceiptComponent] ngOnChanges, receipt=', this.receipt);
    console.trace();
  }

  /* getter: FullAddress */
  get FullAddress(): string {
    const a = this.selectedReceipt?.deliveryAddress;
    return a
      ? `${a.street} #${a.number}, ${a.neighborhood}, C.P. ${a.postalCode}, ${a.city}, ${a.state}`
      : '';
  }

  /* getter: paymentSummary */
  get paymentSummary(): string {
    const p = this.selectedReceipt?.paymentMethod;
    return p
      ? `${p.alias} - ${p.bank} - ${p.method}`
      : '';
  }

}
