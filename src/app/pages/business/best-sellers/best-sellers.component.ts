/* best-sellers.component.ts */
import { Component, OnInit } from '@angular/core';
import { Sale } from '../../../core/models/sale.model';
import { SalesService } from '../../../core/services/sales.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-best-sellers',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './best-sellers.component.html',
  styleUrl: './best-sellers.component.css'
})
export class BestSellersComponent implements OnInit {

  sales: Sale[] = [];
  topSales: { _id: string; name?: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] = [];
  salesByBrand: { brand?: string; name?: string; totalQuantity: number; totalRevenue: number }[] = [];  
  
  public sortFieldProducts: string = 'totalQuantitySold';
  public sortDirProducts: 'asc' | 'desc' = 'desc';
  public sortFieldDates: string = 'soldAt';
  public sortDirDates: 'asc' | 'desc' = 'desc';
  public sortFieldBrands: string = 'totalRevenue';
  public sortDirBrands: 'asc' | 'desc' = 'desc';  
  
  constructor( private salesService: SalesService ) {}
  
  private groupSalesByProduct(sales: Sale[]): { _id: string; name?: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {

    const grouped: Record< string, {
      _id: string;
      name?: string;
      totalQuantitySold: number;
      totalRevenue: number;
      brand?: string;
    }> = {};

    for (const sale of sales) {
      if (!grouped[sale._id]) {
        grouped[sale._id] = {
          _id: sale._id,
          name: sale.name,
          totalQuantitySold: sale.quantity,
          totalRevenue: sale.total,
          brand: sale.brandName
        };
      } else {
        grouped[sale._id].totalQuantitySold += sale.quantity;
        grouped[sale._id].totalRevenue += sale.total;
      }
    }
    return Object.values(grouped);
  } /* fin mt:agrupación por producto */

  /**
   * Ordena los productos agrupados según cantidad vendida (o ingresos si se desea).
   * @param groupedSales Arreglo de productos agrupados.
   * @param byRevenue opcional: Si es true, ordena por ingresos; si es false, por cantidad vendida.
  */
  /* mt: sortGroupedSales */
  private sortGroupedSales(
    groupedSales: { _id: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[],
    byRevenue: boolean = false
  ): { _id: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {
    return groupedSales.sort((a, b) => {
      return byRevenue ? b.totalRevenue - a.totalRevenue : b.totalQuantitySold - a.totalQuantitySold;
    });
  } /* fin sortGroupedSales */

  /**
   * Devuelve los N productos más vendidos del array ya agrupado y ordenado.
   * @param sortedSales Array de productos agrupados y ordenados
   * @param topN Cantidad máxima de productos a devolver
   */
  /* mt: getTopNSales */
  getTopNSales(
    sortedSales: { _id: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[],
    topN: number = 5
  ): { _id: string; totalQuantitySold: number; totalRevenue: number; brand?: string }[] {
    return sortedSales.slice(0, topN);
  } /* fin getTopNSales */

  /* mt: groupSalesByBrand */
  groupSalesByBrand(sales: Sale[]): { brand?: string; name?: string; totalQuantity: number; totalRevenue: number }[] {
    const grouped: Record< string, { brand?: string; name?: string; totalQuantity: number; totalRevenue: number }> = {};

    for (const sale of sales) {
      const key = sale.brandId || 'Sin Marca';
      if (!grouped[key]) {
        grouped[key] = {
          brand: sale.brandId,
          name: sale.name,
          totalQuantity: sale.quantity,
          totalRevenue: sale.total
        };
      } else {
        grouped[key].totalQuantity += sale.quantity;
        grouped[key].totalRevenue += sale.total;
        grouped[key].name = sale.name;
      }
    }

    return Object.values(grouped);
  } /* fin groupSalesByBrand */

  /* mt: updateSalesData */
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
    
  } /* mt: updateSalesData */

  /* mt: toggleSort */
  public toggleSort(
    table: 'products' | 'dates' | 'brands',
    field: string,
    direction: 'asc' | 'desc'
  ): void {
    
    if (table === 'products') {
      if (this.sortFieldProducts === field && this.sortDirProducts === direction ) return;
      this.sortFieldProducts = field;
      this.sortDirProducts = direction;
      this.applySort('products');
    }

    if (table === 'dates') {
      if (this.sortFieldDates === field && this.sortDirDates === direction) return;
      this.sortFieldDates = field;
      this.sortDirDates = direction;
      this.applySort('dates');
    }

    if (table === 'brands') {
      if (this.sortFieldBrands === field && this.sortDirBrands === direction) return;
      this.sortFieldBrands = field;
      this.sortDirBrands = direction;
      this.applySort('brands');
    }
  } /* fin toggleSort */

  /* mt: applySort */
  private applySort( table: 'products' | 'dates' | 'brands' ): void {
    const compare = ( a: any, b: any, field: string, dir: 'asc' | 'desc', isDate = false ) => {
      let va = a [field];
      let vb = b[field];
      if (isDate) {
        va = va ? new Date(va).getTime(): 0;
        vb = vb ? new Date(vb).getTime(): 0;
      }
      if ( typeof va === 'string' ) {
        va = va.toLowerCase();
        vb = ( vb || '' ).toLowerCase();
      }
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    };

    if (table === 'products') {
      const field = this.sortFieldProducts;
      const dir = this.sortDirProducts;
      this.topSales.sort((a, b) => compare (a, b, field, dir, false));
    }

    if(table === 'dates') {
      const field = this.sortFieldDates;
      const dir = this.sortDirDates;
      /* sales[] contiene objetos Sale; si el campo es soldAt, marcar isDate = true */
      const isDate = field === 'soldAt';
      this.sales.sort((a, b) => compare (a, b, field, dir, isDate))
    }

    if (table === 'brands') {
      const field = this.sortFieldBrands;
      const dir = this.sortDirBrands;
      this.salesByBrand.sort((a, b) => compare(a, b, field, dir, false));
    }
  } /* fin applySort */

  /* ***** METODOS DE CICLO DE VIDA ***** */
  /* mt: ngOnInit */
  ngOnInit(): void {    

    // 🔹 Suscripción al BehaviorSubject para actualizaciones dentro de la misma pestaña
    this.salesService.getSales().subscribe((sales: Sale[]) => {
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