/* cards-group.component.ts */
import { Component, Input, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { OffersService } from '../../../core/services/offers.service';
import { WishlistService } from '../../../core/services/wish-list.service';

import { Product } from '../../../core/models/product.model';
import { Subscription } from 'rxjs';
import { Wishlist } from '../../../core/models/wishList.model';

@Component({
  selector: 'app-cards-group',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cards-group.component.html',
  styleUrl: './cards-group.component.css'
})
export class CardsGroupComponent implements OnInit, OnDestroy{

  @Input() products: Product[] = [];
  
  isLoading: boolean = false;

  visibleProducts: Product[] = [];

  tempQuantities: Record< string, number > = {};
  productPrices: Record< string, { basePrice: number, finalPrice:number } > = {};
  
  private wishListProductIds: Set< string > = new Set();
  private subscriptions = new Subscription();
  
  private authService = inject(AuthService);
  private cartService = inject(CartService);  
  private offersService = inject(OffersService);
  private wishListService = inject(WishlistService);
  private router = inject(Router);
  
  public cart$ = this.cartService.cart$;

  ngOnInit() {
    this.isLoading = true;

    this.visibleProducts = this.products.filter( p => p.quantity > 0 );

    this.visibleProducts.forEach( p => {
      const sub = this.offersService.getProductFinalPrice( p._id ).subscribe({
        next: ( priceData ) => {
          this.productPrices[p._id] = priceData;
        }
      });

      this.subscriptions.add( sub );
    });
    
    this.wishListService.getWishlist().subscribe();

    const wishListSub = this.wishListService.wishlist$.subscribe({
      next: ( wishList: Wishlist | null ) => {
        this.wishListProductIds = new Set(
          wishList?.products.map( p=> p.product) ?? []            
        );
      }
    });

    this.subscriptions.add( wishListSub );
    
    setTimeout(() => {
      this.isLoading = false;
    }, 300);
  } /* end ngOnInit */
  
  isProductInWishList( productId: string ): boolean {
    return this.wishListProductIds.has( productId );
  } /* end isProductInWishList */

  toggleWishList( productId: string ): void {

    const user = this.authService.getCurrentUser();

    if ( !user ) {
      return;
    }

    if ( this.wishListProductIds.has( productId )) {
      this.wishListService.removeFromWishlist(productId).subscribe();
    } else {
      this.wishListService.addToWishlist(productId).subscribe();
    }

  } /* end toggleWishList */

  goToProductDetail( productId: string): void {
    this.router.navigate([ '/detalles', productId ]);
  } /* end goToProdutDetail */

  increaseQuantity( p: Product ): void {
    const id = p._id;
    this.tempQuantities[ id ] = ( this.tempQuantities[ id ] || 1 ) +1;
  } /* end increaseQuantity */
  
  decreaseQuantity( p: Product ): void {
    const id = p._id;
    if (( this.tempQuantities[ id ] || 1 ) > 1 ) {
      this.tempQuantities[ id ]--;
    }
  } /* end decreaseQuantity */
  
  isInCart( p: Product ): boolean {
    const cart = this.cartService.getCartSnapshot();

    if(!cart || !cart.items) {
      return false;
    }

    return cart.items.some( item => item.product._id === p._id );
  } /* end isInCart */
  
  onAddToCart( p: Product ): void {

    const user = this.authService.getCurrentUser();

    if ( !user ) {
      return;
    }

    const quantity = this.tempQuantities[ p._id ] || 1;

    if ( this.isInCart(p) ) {
      return;
    }

    this.cartService.addToCart (p._id, quantity ).subscribe();

    this.tempQuantities[ p._id ] = 1;

  } /* end onAddToCart */
  
  onBuyNow( p: Product): void {

    const user = this.authService.getCurrentUser();

    if ( !user ) {
      return;
    }

    const quantity = this.tempQuantities[ p._id ] || 1;

    this.cartService.addToCart( p._id, quantity ).subscribe(() => {
      this.tempQuantities[ p._id ]= 1;
      this.router.navigate([ '/checkout' ]);
    });
  } /* end onBuyNow */
  
  getTotal( p: Product ): number {
    const quantity = this.tempQuantities[ p._id ] || 1;
    return quantity * p.price;
  } /* end getTotal */
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  } /* end ngOnDestroy */

} /* end cardsGroupComponent */