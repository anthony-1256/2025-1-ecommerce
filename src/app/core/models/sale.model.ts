export interface Sale {
  idSale: string;        // identificador de la venta (puede ser UUID o timestamp)
  idProduct: number;     // idProduct del producto vendido (coincide con tu Product.idProduct)
  productName?: string; // nombre del producto, opcional para facilitar reportes
  quantity: number;      // cantidad vendida
  unitPrice: number;     // precio unitario en el momento de la venta
  total: number;         // quantity * unitPrice
  soldAt: string;        // fecha ISO de la venta
  brand?: string;        // opcional, útil para agregados por marca
}