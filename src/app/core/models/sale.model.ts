/* sale.model.ts */
export interface Sale {
  _id: string;
  
  name: string;

  brandId: string;
  brandName: string;

  categoryId: string;
  categoryName: string;

  model: string;
  capacity: string;
  speed: string;

  quantity: number;
  unitPrice: number;
  total: number;

  userId: string;
  soldAt: string;
}

export interface SalesMetrics {
  totalQuantity: number;
  totalRevenue: number;
}

export interface SalesByProduct extends SalesMetrics {
  _id: string;

  name: string;
  brandName: string;
  categoryName: string;

  model: string;
  capacity: string;
  speed: string;

  latestSale: string;
  earliestSale: string;
}

export interface SalesByCategory extends SalesMetrics {
  _id: string;

  categoryName: string;

  latestSale: string;
  earliestSale: string;
}

export interface SalesByBrand extends SalesMetrics {
  _id: string;

  brandName: string;
  logo?: string;

  latestSale: string;
  earliestSale: string;
}

export interface SalesByTime extends SalesMetrics {
  _id: {
    year: number;
    month: number;
    day: number;
  };
}

export interface TopSellingProduct extends SalesMetrics {
  _id: string;

  name: string;
  brandName: string;
  categoryName: string;

  model: string;
  capacity: string;
  speed: string;

  latestSale: string;
  earliestSale: string;  
}