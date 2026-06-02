/* payment-method.model.ts */
import { PaymentMethod } from "../types/enums";

export interface Payment {
    _id: string;
    user: string;
    type: PaymentMethod;
    cardNumber?: string;
    cardHolderName?: string;
    expiryDate?: string;
    paypalEmail?: string;
    bankName?: string;
    accountNumber?: string;
    isDefault: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}