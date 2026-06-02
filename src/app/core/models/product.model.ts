/* product.model.ts */
import { Capacity, Speed } from "../types/enums";
import { Brand } from "../models/brand.model";
import { Category } from "./category.model";

export interface Product {
    _id: string;
    imageURL: string;
    name: string;
    brand: Brand;    
    model: string;
    description: string;
    category: Category;
    capacity: Capacity;
    speed: Speed;
    sku: string;
    price: number;
    quantity: number;
    available: boolean;
    finalPrice?: number;
}