/* src/app/pages/offers/offers.component.ts */
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { PricesService } from '../../core/services/prices.service';
import { SalesService } from '../../core/services/sales.service';
import { Sale } from '../../core/models/sale.model';
import { BrandService } from '../../core/services/brand.service';
import { Brand } from '../../core/types/enums';
import { Brand as BrandModel } from '../../core/models/brand.model';
import { PriceEntry } from '../../core/models/price.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent {
  
  /* ***** PROPIEDADES PÚBLICAS ***** */
  /* ob: productos en oferta */
  public offers: Product[] = [];

  /* ob: slides de productos en oferta */
  public offerSlides: Product[][] = [];

  /* ob: top productos más vendidos */
  public topProducts: Product[] = [];

  /* ob: slides de top productos */
  public topProductSlides: Product[][] = [];

  public brandSlides: { brand: BrandModel; totalSold: number; position: number }[][] = [];
  public prices: PriceEntry[] = [] ;
  public sales: Sale[] = [];
  public brands: BrandModel[] = [];
  public bestSellers: Sale[] = [];
  public topBrands: BrandModel[] = [];

  /* fn: listener para cambios en almacenamiento local */
  private storageListener: ((event: StorageEvent) => void) | null = null;

  /* ***** SUSCRIPCIONES / OBSERVABLES ADICIONALES ***** */
  private brandsSubscription: Subscription | null = null;
  private salesSubscription: Subscription | null = null;
  private categoriesSubscription: Subscription | null = null;
  private productsSubscription: Subscription | null = null;
  private pricesSubscription: Subscription | null = null;
  
  /* ***** FLAGS DE UI / ESTADO ***** */
  isLoading: boolean = false;

  /* ***** CONSTRUCTOR ***** */
  constructor (
    private productService: ProductService,
    public pricesService: PricesService,
    private salesService: SalesService,
    public brandService: BrandService
  ) {}


  /* ***** CICLO DE VIDA ***** */
  /* mt: ngOnInit */
  ngOnInit(): void {
    this.isLoading = true;

    /* Subscripción a productos */
    this.productsSubscription = this.productService.products$.subscribe(products => {
      this.offers = products.filter(p => p.isOffer ?? false);
      this.offerSlides = this.chunkArray(this.offers, 4);

      this.offers.forEach(product => {
        const lastPrice = this.pricesService.getLastPrice(product.idProduct);
        const hasDiscount = this.pricesService.isPercentageDiscount(product.idProduct);
        (product as any).lastPrice = lastPrice;
        (product as any).hasDiscount = hasDiscount;
      });

      console.log('✅ offerSlides:', this.offerSlides);
    });

    /* Subscripción a precios */
    this.pricesSubscription = this.pricesService.prices$.subscribe(prices => {
      this.prices = prices;
    });

    /* Subscripción a ventas globales */
    this.salesService.sales$.subscribe((sales) => {
      this.bestSellers = sales;
      this.sales = this.bestSellers;
      this.updateTopProductsAndBrands();
    });
    /* Subscripción a marcas globales */
    this.brandService.brands$.subscribe((brands) => {
      this.topBrands = brands;
      this.brands = this.topBrands;
      this.updateTopProductsAndBrands();
    });
    
    this.storageListener = (event: StorageEvent) => {
      const key = event.key || '';

      if (['products', 'brands', 'sales', 'prices'].includes(key)) {
        console.log('%c[OffersComponent] Listener activado', 'color: cyan; font-weight: bold;');
        console.log('Evento completo:', event);
        console.log('Clave modificada:', key);
        console.log('Contenido actual de sales (antes de recargar):', this.sales);

        this.salesService.loadSalesFromLocalStorage();
        this.brandService.refreshBrands();

        console.log('Sales recargadas desde storage:', this.salesService['salesSubject'].value);
        console.log('Brands recargadas desde storage:', this.brandService['brandSubject'].value);

        this.updateTopProductsAndBrands();
      }
    };
    window.addEventListener('storage', this.storageListener);

    setTimeout(() => { this.isLoading = false; }, 500);
  } /* fin ngOnInit */


  /* ngOnDestroy */
  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    this.pricesSubscription?.unsubscribe();
    this.salesSubscription?.unsubscribe();
    this.brandsSubscription?.unsubscribe();
    
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
      this.storageListener = null;
    }
  } /* fin ngOnDestroy */

  /* ***** MÉTODOS PÚBLICOS ***** */
  /* mt: getLastPrice */
  
  /* mt: isPercentageDiscount */
  

  /* ***** MÉTODOS PRIVADOS ***** */
  /* fn: chunkArray */
  private chunkArray(arr: any[], size: number): any[][] {
    const result: any[][] = [];    
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }    
    return result;
  } /* fin chunkArray */

  /* fn: getCardWidth */
  public getCardWidth(slideLength: number): string {
    switch(slideLength) {
      case 1: return '25rem';
      case 2: return '20rem';
      case 3: return '18rem';
      case 4: return '15rem';
      default: return '14rem';
    }
  } /* fin getCardWidth */

  /* fn: updateTopProductsAndBrands */
  private updateTopProductsAndBrands(): void {
    if (!this.sales || this.sales.length === 0) {
      this.topProducts = [];
      this.topProductSlides = [];
      this.brandSlides = [];
      return;
    }

    const grouped: Record<number, { productId: number; quantitySold: number }> = {};
    for (const sale of this.sales){
      const pid = sale.idProduct;
      if (!grouped[pid]) {
        grouped[pid] = { productId: pid, quantitySold: sale.quantity };
      } else {
        grouped [pid].quantitySold += sale.quantity;
      }
    }

    const sortedTop = Object.values(grouped)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 6);
    
    this.topProducts = sortedTop
      .map(g => this.productService.getProductById(g.productId))
      .filter( (p): p is Product => !!p );

    const seenBrands = new Set<number>();
    this.topProducts = this.topProducts.filter(p => {
      if (!p || !p.brand) return false;
      if (seenBrands.has(p.brand.idBrand)) return false;
      seenBrands.add(p.brand.idBrand);
      return true;
    });

    this.topProductSlides = this.chunkArray(this.topProducts, 2);

    const brandTotals: Record<number, { brand: BrandModel; totalSold: number }> = {};
    for (const sale of this.sales) {
      const prod = this.productService.getProductById(sale.idProduct);
      const b = prod?.brand;
      if (!b) continue;
      const id = b.idBrand;
      if (!brandTotals[id]) {
        brandTotals[id] = { brand: b, totalSold: 0 };
      }
      brandTotals[id].totalSold += sale.quantity;
    }

    const sortedBrandEntries = Object.values(brandTotals).sort((a, b) => b.totalSold - a.totalSold);

  const rankedBrands: { brand: BrandModel; totalSold: number; position: number }[] =
    sortedBrandEntries.map((entry, idx) => ({
      brand: entry.brand,
      totalSold: entry.totalSold,
      position: idx + 1
    }));

  this.brandSlides = this.chunkArray(rankedBrands, 3);

  // logs para depuración
  console.log('🔁 updateTopProductsAndBrands -> topProductSlides:', this.topProductSlides);
  console.log('🔁 updateTopProductsAndBrands -> brandSlides:', this.brandSlides);
  console.log('%c[OffersComponent] 🔄 Carruseles actualizados en tiempo real', 'color: lime; font-weight: bold;');

  }


} /* fin OffersComponent */