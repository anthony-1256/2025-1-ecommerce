import { Injectable } from '@angular/core';
import { CartService } from './cart.service';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { Address } from '../models/address.model';
import { Payment } from '../models/payment.model';
import { Receipt, ReceiptItem } from '../models/receipt.model';

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {

  private readonly receiptKeyPrefix = 'receipts_user_';

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private productService: ProductService,
  ){}

  private readonly companyInfo = {
    name: 'FullStorAgs',
    address: 'Avenida',
    phone: '777-777-77-77',
    taxId: 'TNV-88774-MX1',
    email: 'ventas@fullstorags.com.mx'
  };

  generateReceiptFromCart(
    selectedAddress: Address,
    selectedPaymentMethod: Payment
  ): Receipt | null {

    console.log('generateReceiptFromCart called with:', { selectedAddress, selectedPaymentMethod });
    console.log('current cart:', this.cartService.getCart());


    const cart = this.cartService.getCart();

    if (!cart || !cart.items.length) return null;

    const userId = Number(cart.idUser);

    /* Mapeo de datos esenciales */
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

  /* validacion simple para cantidades no negativas */
  if (receiptItems.some(i => i.quantity <= 0)) return null;

  const totalQuantity = receiptItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = receiptItems.reduce((sum, item) => sum + item.totalPrice, 0);

  const newReceipt: Receipt = {
    idReceipt: crypto.randomUUID(),
    idUser: userId,    
    date: new Date(),
    items: receiptItems,
    totalQuantity,
    totalAmount, paymentMethod: selectedPaymentMethod,
    deliveryAddress: selectedAddress,
    companyInfo: this.companyInfo,
    notes: 'Gracias por su compra, conserva este comprobante',
  };

    // Limitar a los últimos 50 recibos por usuario
    let userReceipts = this.getReceiptsByUser(userId);
    if (userReceipts.length >= 50) {
      userReceipts.shift();
    }

    userReceipts.push(newReceipt);
    this.saveReceiptsByUser(userId, userReceipts);

    // Descontar stock
    for (const item of receiptItems) {
      const product = item.product;
      const currentStock = this.productService.getProductById(product.idProduct)?.quantity ?? 0;
      this.productService.updateProductStock(product.idProduct, currentStock - item.quantity);
    }

    // Limpiar carrito
    this.cartService.clearCart();

    return newReceipt;
  }


  getReceiptsByUser(userId: number): Receipt[] {
    const key = `${this.receiptKeyPrefix}${userId}`;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  }

  saveReceiptsByUser(userId: number, receipts: Receipt[]): void {
    const key = `${this.receiptKeyPrefix}${userId}`;
    localStorage.setItem(key, JSON.stringify(receipts));
  }
}
