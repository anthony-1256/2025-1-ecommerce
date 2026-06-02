/* print-receipt.component.ts */
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Receipt } from '../../../core/models/receipt.model';
import { ActivatedRoute } from '@angular/router';
import { CompanyInfoService } from '../../../core/services/company-info.service'; /* <-- ajuste pc#00004: eliminado import de model */
import { PurchaseService } from '../../../core/services/purchase.service'; /* <-- ajuste pc#00004 */

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

  companyData!: { name: string; rfc: string; address: string; phone: string; email: string }; /* <-- ajuste pc#00004 */

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private purchaseService: PurchaseService, /* <-- ajuste pc#00004 */
    private companyInfoService: CompanyInfoService
  ) {}

  ngOnInit(): void {
    console.log('[PrintReceiptComponent] ngOnInit, receipt=', this.receipt);
    console.trace();

    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      const user = this.authService.getCurrentUser();
      if (user) {
        const receipts = this.purchaseService.getReceiptsByUser(Number(user._id)) || []; /* <-- ajuste pc#00004 */
        this.selectedReceipt = receipts.find(r => r.idReceipt == idParam) || null;

        const company = this.companyInfoService.getCompanyWithBranch('1'); /* <-- ajuste pc#00004 */
        const branch = company.branch ?? company.branches[0];
        this.companyData = {
          name: company.name,
          rfc: company.rfc,
          address: branch?.address ?? '',
          phone: branch?.phone ?? '',
          email: branch?.email ?? ''
        };
      }
    } else {
      this.selectedReceipt = this.receipt;

      const company = this.companyInfoService.getCompanyWithBranch('1'); /* <-- ajuste pc#00004 */
      const branch = company.branch ?? company.branches[0];
      this.companyData = {
        name: company.name,
        rfc: company.rfc,
        address: branch?.address ?? '',
        phone: branch?.phone ?? '',
        email: branch?.email ?? ''
      };
    }

    const closeWindow = () => {
      try {
        setTimeout(() => window.close(), 50);
      } catch (e) {
        console.warn('closeWindow fallo', e);
      }
    };

    const fallbackTimer = window.setTimeout(() => {
      console.warn('fallback: cerrando ventana de impresión');
      closeWindow();
    }, 6000);

    const afterPrintHandler = () => {
      window.clearTimeout(fallbackTimer);
      try { window.removeEventListener('afterprint', afterPrintHandler); } catch {}
      closeWindow();
    };

    try {
      window.addEventListener('afterprint', afterPrintHandler);
    } catch (e) {
      // @ts-ignore
      window.onafterprint = afterPrintHandler;
    }

    let mq: MediaQueryList | null = null;
    if ('matchMedia' in window) {
      mq = window.matchMedia('print');

      const mqListener = (m: MediaQueryListEvent) => {
        if (m.matches === false) {
          window.clearTimeout(fallbackTimer);
          closeWindow();
          try { mq?.removeEventListener('change', mqListener); } catch {}
        }
      };

      mq.addEventListener('change', mqListener);
    }

    setTimeout(() => {
      try {
        window.focus();
        window.print();
      } catch (e) {
        console.warn('print fallo', e);
        window.clearTimeout(fallbackTimer);
        closeWindow();
      }
    }, 250);
  } /* fin ngOnInit */

  ngOnChanges(): void {
    console.log('[PrintReceiptComponent] ngOnChanges, receipt=', this.receipt);
    console.trace();
  } /* end ngOnChanges */

  get FullAddress(): string {
    const a = this.selectedReceipt?.deliveryAddress;
    return a
      ? `${a.street} #${a.number}, ${a.neighborhood}, C.P. ${a.postalCode}, ${a.city}, ${a.state}`
      : '';
  } /* end FullAddress */

  get paymentSummary(): string { /* <-- ajuste pc#00004 */
    const p = this.selectedReceipt?.paymentMethod;
    if (!p) return '';
    const bank = p.bankName ? ` - ${p.bankName}` : '';
    return `${p.type}${bank}`;
  } /* end paymentSummary */

} /* end PrintReceiptComponent */