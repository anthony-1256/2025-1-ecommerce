import { BankOption, PaymentMethod } from "../types/enums";

export interface Payment {
    method: PaymentMethod;
    bank?: BankOption;
    alias?: string;
    isDefault: boolean;
}

export interface UserPaymentEntry {
    idUser: number;
    payments: Payment[];
}