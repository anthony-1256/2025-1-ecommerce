import { Address } from "./address.model";
import { Payment } from "./payment.model";
import { Product } from "./product.model";

export interface ReceiptItem {

    product: Product;
    quantity: number;
    unitPrice: number;
    totalPrice: number;

}

export interface Receipt {
    idReceipt: string;
    idUser: number;
    date: Date;
    items: ReceiptItem[];
    totalQuantity: number;
    totalAmount: number,
    paymentMethod: Payment;
    deliveryAddress: Address;
    
    companyInfo: {
        name: string;
        address: string;
        phone: string;
        taxId?: string;
        email?:string;
    };
    notes?: string;
}