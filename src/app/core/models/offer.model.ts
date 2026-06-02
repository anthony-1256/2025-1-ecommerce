/* offer.model.ts */
import { Product } from "./product.model";

export interface Offer {
    _id: string;
    product: string | Product;
    discountType: 'percentage' | 'fixed';
    discountValue: number;    
    startDate: string;
    endDate: string;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}