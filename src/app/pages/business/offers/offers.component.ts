/* offers.component.ts */
import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription, catchError, forkJoin, map, of } from 'rxjs';
import { SalesByBrand, TopSellingProduct } from '../../../core/models/sale.model';
import { SalesService } from '../../../core/services/sales.service';
import { OffersService } from '../../../core/services/offers.service';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent implements OnInit, OnDestroy {
  
  topProducts: TopSellingProduct[] = [];
  brandSales: SalesByBrand[] = [];

  offerSlides: TopSellingProduct[][] = [];
  brandSlides: SalesByBrand[][] = [];
  topProductSlides: TopSellingProduct[][] = [];

  lastPrices: { [ key: string ]: number } = {};
  productImages: { [ key: string ]: string } = {};
  finalPrices: { [key: string]: number } = {};

  isLoading: boolean = false;

  private productService = inject(ProductService);
  private offersService = inject(OffersService);
  private salesService = inject(SalesService);
  private subscriptions = new Subscription();

  ngOnInit() {
    this.isLoading = true;

    const sub = forkJoin({
      topProducts: this.salesService.getTopSellingProducts(),
      brandSales: this.salesService.getSalesByBrand()
    }).subscribe(({ topProducts, brandSales }) => {

      this.topProducts = topProducts;
      this.brandSales = brandSales;

      this.topProductSlides = this.buildSlides(topProducts);
      this.offerSlides = this.buildSlides(topProducts);
      this.brandSlides = this.buildSlides(brandSales);

      this.loadFinalPrices( topProducts );

      this.isLoading = false;
    });
    
    this.subscriptions.add( sub );
  } /* end ngOnInit */

  private buildSlides<T>( items: T[], chunkSize: number = 3 ): T[][] {
    const slides: T[][] = [];

    for ( let i = 0; i < items.length; i += chunkSize ) {
      slides.push( items.slice(i, i +chunkSize));
    }

    return slides;
  } /* end buildSlides */

  getCardWidth( items: number ): string {
    if ( items <= 1) return '100%';
    if ( items === 2) return '45%';
    if ( items === 3) return '30%';
    if ( items === 4) return '23%';
    
    return '18%';
  } /* end getCardWidth */

  private loadFinalPrices( products: TopSellingProduct[] ): void {

    const productsWithDiscount: TopSellingProduct[] = [];

    const requests = products.map( p => {
      return this.offersService.getProductFinalPrice( p._id ).pipe(
        map( res => {

          this.lastPrices[ p._id ] = res.basePrice;

          this.finalPrices[ p._id ] = res.finalPrice;

          this.productService.getProductById( p._id ).subscribe({
            next: ( product ) => {
              this.productImages[ p._id ] = product.imageURL;
            }
          });

          if ( res.hasDiscount ) {
            productsWithDiscount.push( p );
          }

          return res;
        }),
        catchError( err => {
          console.error( '[ loadFinalProces ]', err );
          this.lastPrices[ p._id ] = 0;
          return of({
            basePrice: 0,
            finalPrice: 0,
            hasDiscount: false
          });
        })
      );
    });

    const sub = forkJoin( requests ).subscribe(() => {

      this.offerSlides = this.buildSlides( productsWithDiscount );
    
    });

    this.subscriptions.add( sub );
  } /* end loadFinalPrices */

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  } /* end ngOnDestroy */

} /* end OffersComponent */