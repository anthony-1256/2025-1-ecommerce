/* purchase.service.ts */
import { Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { Address } from '../../core/models/address.model';
import { Payment } from '../../core/models/payment-method.model';
import { Receipt, ReceiptItem } from '../../core/models/receipt.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private readonly receiptKeyPrefix = 'receipts_user_';

  constructor(
    private cartService: CartService
    /* <-- ajuste pc#00003: ProductService eliminado, no se usa */
  ) {}

  private readonly companyInfo = {
    name: 'FullStorAgs',
    address: 'Avenida',
    phone: '777-777-77-77',
    taxId: 'TNV-88774-MX1',
    email: 'ventas@fullstorags.com.mx'
  };

  async generateReceiptFromCart( /* <-- ajuste pc#00003: async + Promise */
    selectedAddress: Address,
    selectedPaymentMethod: Payment
  ): Promise<Receipt | null> {

    console.log('generateReceiptFromCart called with:', { selectedAddress, selectedPaymentMethod });

    const cart = await firstValueFrom(this.cartService.cart$);

    if (!cart || !cart.items.length) return null;

    const userId = Number(cart._id); /* <-- ajuste pc#00003: _id string → number para Receipt._id */

    const receiptItems: ReceiptItem[] = cart.items.map(item => {
      const product = item.product;
      const unitPrice = product.price;
      const quantity = item.quantity;
      const totalPrice = unitPrice * quantity;

      return {
        product,
        quantity,
        unitPrice,
        totalPrice,
      };
    });

    if (receiptItems.some(i => i.quantity <= 0)) return null;

    const totalQuantity = receiptItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = receiptItems.reduce((sum, item) => sum + item.totalPrice, 0);

    const newReceipt: Receipt = {
      idReceipt: crypto.randomUUID(),
      _id: userId,
      date: new Date(),
      items: receiptItems,
      totalQuantity,
      totalAmount,
      paymentMethod: selectedPaymentMethod,
      deliveryAddress: selectedAddress,
      companyInfo: this.companyInfo,
      notes: 'Gracias por su compra, conserva este comprobante',
    };

    let userReceipts = this.getReceiptsByUser(userId);
    if (userReceipts.length >= 50) {
      userReceipts.shift();
    }

    userReceipts.push(newReceipt);
    this.saveReceiptsByUser(userId, userReceipts);

    /* descuento de stock eliminado: responsabilidad del backend */ /* <-- ajuste pc#00003 */

    this.cartService.clearCart().subscribe(); /* <-- ajuste pc#00003 */

    return newReceipt;
  } /* end generateReceiptFromCart */

  getReceiptsByUser(userId: number): Receipt[] { /* <-- ajuste pc#00003 */
    const key = `${this.receiptKeyPrefix}${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } /* end getReceiptsByUser */

  saveReceiptsByUser(userId: number, receipts: Receipt[]): void {
    const key = `${this.receiptKeyPrefix}${userId}`;
    localStorage.setItem(key, JSON.stringify(receipts));
  } /* end saveReceiptsByUser */

} /* end PurchaseService */