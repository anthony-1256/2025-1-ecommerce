import { Component } from '@angular/core';
import { Sale } from '../../core/models/sale.model';
import { SalesService } from '../../core/services/sales.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-best-sellers',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './best-sellers.component.html',
  styleUrl: './best-sellers.component.css'
})
export class BestSellersComponent {

  /* ***** PROPIEDADES PÚBLICAS ***** */
  sales: Sale[] = [];
  topSales: { idProduct: number; productName?: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] = [];
  salesByBrand: { brand?: string; productName?: string; totalQuantity: number; totalRevenue: number }[] = [];
  
  /* ***** PROPIEDADES DE CONTROL DE ORDEN GLOBAL POR TABLA ***** */
  public sortFieldProducts: string = 'totalQuantitySold';
  public sortDirProducts: 'asc' | 'desc' = 'desc';
  public sortFieldDates: string = 'soldAt';
  public sortDirDates: 'asc' | 'desc' = 'desc';
  public sortFieldBrands: string = 'totalRevenue';
  public sortDirBrands: 'asc' | 'desc' = 'desc';

  
  /* ***** CONTROLADOR ***** */
  constructor( private salesService: SalesService ) {}

  /* mt: groupSalesByProduct */
  private groupSalesByProduct(sales: Sale[]): { idProduct: number; productName?: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {
    const grouped: Record<number, { idProduct: number; productName?: string; totalQuantitySold: number; totalRevenue: number; brand?: string }> = {};

    for (const sale of sales) {
      if (!grouped[sale.idProduct]) {
        grouped[sale.idProduct] = {
          idProduct: sale.idProduct,
          productName: sale.productName,
          totalQuantitySold: sale.quantity,
          totalRevenue: sale.total,
          brand: sale.brand
        };
      } else {
        grouped[sale.idProduct].totalQuantitySold += sale.quantity;
        grouped[sale.idProduct].totalRevenue += sale.total;
      }
    }
    return Object.values(grouped);
  } /* fin mt:agrupación por producto */

  /**
   * Ordena los productos agrupados según cantidad vendida (o ingresos si se desea).
   * @param groupedSales Arreglo de productos agrupados.
   * @param byRevenue opcional: Si es true, ordena por ingresos; si es false, por cantidad vendida.
  */
  /* mt: ordenar ventas agrupadas */
  private sortGroupedSales(
    groupedSales: { idProduct: number; totalQuantitySold: number; totalRevenue: number; brand?: string }[],
    byRevenue: boolean = false
  ): { idProduct: number; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {
    return groupedSales.sort((a, b) => {
      return byRevenue ? b.totalRevenue - a.totalRevenue : b.totalQuantitySold - a.totalQuantitySold;
    });
  }

  /**
   * Devuelve los N productos más vendidos del array ya agrupado y ordenado.
   * @param sortedSales Array de productos agrupados y ordenados
   * @param topN Cantidad máxima de productos a devolver
   */
  getTopNSales(
    sortedSales: { idProduct: number; totalQuantitySold: number; totalRevenue: number; brand?: string }[],
    topN: number = 5
  ): { idProduct: number; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {
    return sortedSales.slice(0, topN);
  }

  groupSalesByBrand(sales: Sale[]): { brand?: string; productName?: string; totalQuantity: number; totalRevenue: number }[] {
    const grouped: Record<string, { brand?: string; productName?: string; totalQuantity: number; totalRevenue: number }> = {};

    for (const sale of sales) {
      const key = sale.brand || 'Sin Marca';
      if (!grouped[key]) {
        grouped[key] = {
          brand: sale.brand,
          productName: sale.productName,
          totalQuantity: sale.quantity,
          totalRevenue: sale.total
        };
      } else {
        grouped[key].totalQuantity += sale.quantity;
        grouped[key].totalRevenue += sale.total;
        grouped[key].productName = sale.productName;
      }
    }

    return Object.values(grouped);
  }

  /* mt:actualizar datso de ventas para todas las pestañas */
  private updateSalesData( sales: Sale[] ): void {

    /* guardar todas las ventas */
    this.sales = sales;

    /* Agrupar ventas por marca */
    this.salesByBrand = this.groupSalesByBrand(this.sales)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    /* Agrupar ventas por producto */
    const grouped = this.groupSalesByProduct(this.sales);

    /* Ordenar productos por cantidad vendida */
    const sorted = this.sortGroupedSales(grouped);

    /* Obtener el top  productos */
    this.topSales = this.getTopNSales(sorted, 5);

    console.log('Top productos más vendidos actualizados: ', this.topSales);
    console.log('Ventas agrupadas por marca: ', this.salesByBrand);
  }

  /* ***** METODOS DE CICLO DE VIDA ***** */
  /* mt: ngOnInit */
  ngOnInit(): void {

    // 🔹 Sincronizar históricos al iniciar
    this.salesService.syncHistoricReceipts();

    // 🔹 Suscripción al BehaviorSubject para actualizaciones dentro de la misma pestaña
    this.salesService.sales$.subscribe(sales => {
      this.updateSalesData(sales);
    });

    // 🔹 Listener para cambios en localStorage desde otras pestañas del navegador
    window.addEventListener('storage', (event) => {
      if (event.key === 'app_sales_v1') {
        const newSales: Sale[] = JSON.parse(event.newValue || '[]');
        this.updateSalesData(newSales);
      }
    });

  } /* fin ngOnInit */

} /* fin BestSellersComponent */