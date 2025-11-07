/* price.model.ts */

export interface PriceEntry {
    
    idProduct: number;
    adjustmentValue: number;
    discountPercentage: number;    
    currentPrice: number;
    priceAdjustment: number;
    previousPrice: number;    
    finalPrice: number;
    adjustmentType: '+' | '-';
}