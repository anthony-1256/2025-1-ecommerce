/* card-view.component.ts */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription, firstValueFrom } from 'rxjs';

import Swal from 'sweetalert2';
import { ProductService } from '../../../core/services/product.service';
import { SalesService } from '../../../core/services/sales.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-card-view',
  standalone: true,
  imports: [ CommonModule, FormsModule, RouterLink ],
  templateUrl: './card-view.component.html',
  styleUrl: './card-view.component.css'
})
export class CardViewComponent implements OnInit, OnDestroy {

product!: Product;

quantity: number = 1;

recomendedProducts: Product[] = [];

cartQuantity: number = 0;

private cartSubscription: Subscription | null = null;

isLoading: boolean = false;
  
  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,    
  ) {} /* fin Constructor */

  ngOnInit(): void {

    this.isLoading = true;

    this.route.paramMap.subscribe({
      next: ( params ) => {

        const productId = params.get('id');

        if ( !productId ) {
          this.isLoading = false;
          return;
        }

        this.productService.getProductById( productId ).subscribe({
          next: ( product ) => {

            this.product = product;

            this.loadRecommendedProducts();

            window.scrollTo({
              top: 0,
              behavior: 'smooth'
            });

            this.isLoading = false;
          },

          error: () => {
            this.isLoading = false;

            Swal.fire({
              title: 'Producto no encontrado',
              text: 'No fue posible cargar el producto.',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });

            this.router.navigate(['/']);
          }
        });
      }
    });

    this.cartSubscription = this.cartService.cart$.subscribe({
      next: ( cart ) => {

        if ( !cart ) {
          this.cartQuantity = 0;
          return;
        }

        this.cartQuantity = cart.items.reduce(
          ( total: number, item: { quantity: number } ) => total + item.quantity,
          0
        );
      }
    });

  } /* end ngOnInit */

  async loadRecommendedProducts(): Promise<void> {

    if ( !this.product?._id ) {
      return;
    }

    try {

      const topProducts = await firstValueFrom(
        this.salesService.getTopSellingProducts( 10 )
      );

      const recommendedIds = topProducts
        .map( product => product._id )
        .filter(( id ) => id !== this.product._id );

      const recommendedProducts: Product[] = [];

      for ( const productId of recommendedIds ) {

        const product = await firstValueFrom(
          this.productService.getProductById( productId )
        );

        recommendedProducts.push( product );

        if ( recommendedProducts.length === 3 ) {
          break;
        }

      }

      this.recomendedProducts = recommendedProducts;

    } catch ( error ) {

      console.error(
        '[CardViewComponent] Error al cargar productos recomendados:',
        error
      );

      this.recomendedProducts = [];

    }

  } /* end loadRecommendedProducts */

  isInCart( productId: string ): boolean {

    const cart = this.cartService.getCartSnapshot();

    if ( !cart ) {
      return false;
    }

    return cart.items.some(
      ( item: { product: Product } ) => item.product._id === productId
    );

  } /* end isInCart */
  
  onAddToCart( product: Product ): void {

    if (!product._id) return;

    if ( this.isInCart( product._id ) ) {

      Swal.fire({
        title: 'Producto ya agregado',
        text: `${ product.name } ya existe en el carrito.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });

      return;

    }

    this.cartService
      .addToCart( product._id, this.quantity )
      .subscribe({
        next: () => {

          this.quantity = 1;

        }
      });

  } /* end onAddToCart */ 

  onBuyNow( product: Product ): void {

    if (!product._id) return;

    if ( this.isInCart( product._id ) ) {

      this.router.navigate([ '/cart' ]);
      return;

    }

    if (!product._id) return;

    this.cartService.addToCart( product._id, this.quantity )
      .subscribe({
        next: () => {

          this.quantity = 1;

          this.router.navigate([ '/checkout' ]);

        }
      });

  } /* end onBuyNow */

  goToProduct( productId: string ): void {

    this.isLoading = true;

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    this.router.navigate([
      '/detalles',
      productId
    ]);

  } /* end goToProduct */

  open( product: Product ): void {

    this.product = product;
    this.quantity = 1;
    this.loadRecommendedProducts();

  } /* end open */

  ngOnDestroy(): void {
    this.cartSubscription?.unsubscribe();
  } /* end ngOnDestroy */

} /* end card-view.component.ts */