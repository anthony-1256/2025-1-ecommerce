import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Sale } from '../models/sale.model';
import { ProductService } from './product.service';


@Injectable({
  providedIn: 'root'
})

export class SalesService {

  private readonly LOCAL_STORAGE_KEY = 'app_sales_v1';

  private _sales: Sale[] = [];
  private salesSubject = new BehaviorSubject<Sale[]>([]);
  public sales$ = this.salesSubject.asObservable();
  private historicSynced = false;
  private readonly HISTORIC_SYNC_KEY = 'historicSalesSynced_v1';

  constructor(
    private productService: ProductService    
  ) {
    this.loadSalesFromLocalStorage();
  }

  loadSalesFromLocalStorage(): void {
    try {
      const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];

      this._sales = Array.isArray(parsed) ? parsed : [];


    } catch (err) {
      console.error('Salesservice: error al parsear ventas desde localstorage', err);
      this._sales = [];
    }
    this.salesSubject.next([...this._sales]);
  }

  persistSalesToLocalStorage(): void {
    try {
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(this._sales)); // Clave
      this.salesSubject.next([...this._sales]); // Clave
    } catch (err) {
      console.error('SalesService: error al guardar ventas en locaStorage', err);
    }  
  }

  registerSale(
    userId: string,
    productName: string,
    idProduct: number,
    quantity: number,
    unitPrice: number,
    brand?: string
  ): void {

    // 🔹 Obtener el producto para acceder a su nombre y marca
    const product = this.productService.getProductById(idProduct);

    const newSales: Sale = {
      idSale: crypto.randomUUID(),
      idProduct,
      productName: product?.productName, // 👈 Aquí ya usas el nombre
      quantity,
      unitPrice,
      total: quantity * unitPrice,
      soldAt: new Date().toISOString(),
      brand: product?.brand.name ?? brand // 👈 prioriza el de ProductService, si no usa el recibido
    };

    /* Guardar en lista global */
    this._sales.push(newSales); // Clave
    this.persistSalesToLocalStorage(); // Clave

    /* Guardar en lista de usuario */
    try {
      const raw = localStorage.getItem('app_sales_by_user');
      const salesByUser = raw ? (JSON.parse(raw) as Record<string, Sale[]>) : {};
      if (!salesByUser[userId]) {
        salesByUser[userId] = [];
      }
      salesByUser[userId].push(newSales);
      localStorage.setItem('app_sales_by_user', JSON.stringify(salesByUser)); 
    } catch (err) {
      console.log('SalesService: error al guardar ventas por usuario', err);
    }    
  }; /* fin registerSale */
  
  /*
   * mt: sincroniza todos los recibos históricos en localStorage hacia el array de ventas
   * Esto asegura que BestSellersComponent pueda mostrar ventas pasadas sin borrar usuarios ni productos.
  */
  public syncHistoricReceipts(): void {
    // 🔒 Revisar flag persistente en localStorage
    const syncedFlag = localStorage.getItem('historicSalesSynced_v1');
    if (syncedFlag === 'true') return; // Ya sincronizado, salir
    
    // 🔓 Marcar como sincronizado en localStorage
    localStorage.setItem('historicSalesSynced_v1', 'true');
    this.historicSynced = true;
    
    /* Filtrar todas las claves que contienen recibos por usuario */
    Object.keys(localStorage)
      .filter(key => key.startsWith('receipts_user_'))
      .forEach(key => {
      try {
        const receipts = JSON.parse(localStorage.getItem(key) || '[]');
        const userId = key.split('_')[2];
        
        receipts.forEach((receipt: any) => {
          receipt.items.forEach((item: any) => {

            const exists = this._sales.some(s =>
              s.idProduct === item.product.idProduct.idProduct &&
              s.soldAt === receipt.date
            );
            if (exists) return;
            
            console.log('DEBUG item: ', item);
            
            /* Registrar cada item como venta en SalesService */
            this.registerSale(
              userId,
              item.product.productName,
              item.product.idProduct,
              item.quantity,
              item.unitPrice,
              item.product.brand
            );
          });
        });
      } catch (err) {
        console.error(`SalesService: error al sincronizar ${key}`, err);
      }
    });
    console.log('SalesService: historico de ventas sincronizado con éxito.');
    
    this.salesSubject.next([...this._sales]);
  }


}