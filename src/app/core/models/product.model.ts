/***** src/app/core/models/product.model.ts ****/
import { Capacity, ProductCategory, Speed } from "../types/enums";

import { Brand } from "../models/brand.model";


export interface Product {
    idProduct: number;
    imgProduct: string;
    productName: string;
    brand: Brand;    
    model: string;
    description: string;
    category: ProductCategory;    
    capacity: Capacity;
    speed: Speed;
    sku: string;
    price: number;
    quantity: number;
    available: boolean;
    isOffer?: boolean;
}