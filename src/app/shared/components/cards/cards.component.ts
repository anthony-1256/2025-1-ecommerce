/* cards.component.ts */
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wish-list.service';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cards',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './cards.component.html',
  styleUrl: './cards.component.css'
})
export class CardsComponent implements OnInit, OnDestroy {
  
  @Input() isVisible: boolean = true;
  @Input() products: Product[] = [];  
    
  product!: Product;
  visibleProducts: Product[] = [];
  recomendedProducts: Product[] = [];
  
  tempQuantities: { [ id: string ]: number } = {};
  
  
  private productsSubscription: Subscription | null = null;  
  
  isLoading: boolean = false;  
  
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private wishlistService = inject( WishlistService );
  
  cart$ = this.cartService.cart$;
  
  public favoriteIds: Set< string > = new Set();  
  
  ngOnInit(): void {

    this.isLoading = true;  
    this.visibleProducts = this.products.filter(p => p.quantity > 0);
  
    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => this.syncQuantitiesWithInventory(products)
    });

    setTimeout(() => { this.isLoading = false; }, 500);
  } /* fin ngOnInit */  
  
  private syncQuantitiesWithInventory(products: Product[]): void {
    this.visibleProducts = products.filter(p => p.quantity > 0);
    console.log('Inventario sincronizado. Productos visibles:', this.visibleProducts.length);
  } /* fin syncQuantitiesWithInventory */
  
  increaseQuantity(p: Product): void {
    if (!p._id) return;
    const id = p._id;
    this.tempQuantities[id] = (this.tempQuantities[id] || 1) + 1;
    console.log(`Cantidad temporal aumentada para ${p.name}:`, this.tempQuantities[id]);
  } /* fin increaseQuantity */
  
  decreaseQuantity(p: Product): void {
    if (!p._id) return;
    const id = p._id;
    if ((this.tempQuantities[id] || 1) > 1) {
      this.tempQuantities[id]--;
      console.log(`Cantidad temporal disminuida para ${p.name}:`, this.tempQuantities[id]);
    }
  } /* fin decreaseQuantity */
  
  getTotal( p: Product ): number {

    const tempQty = this.tempQuantities[ p._id ?? '' ];

    const cart = this.cartService.getCartSnapshot();

    if ( !cart ) {
      return ( tempQty || 1 ) * p.price;
    }

    const item = cart.items.find(
      ( item: { product: Product; quantity: number } ) =>
        item.product._id === p._id
    );

    const quantity =
      tempQty !== undefined
        ? tempQty
        : ( item ? item.quantity : 1 );

    return quantity * p.price;

  } /* fin getTotal */
  
  getQuantity( p: Product ): number {

    const cart = this.cartService.getCartSnapshot();

    if ( !cart ) {
      return 0;
    }

    const item = cart.items.find(
      ( item: { product: Product; quantity: number } ) =>
        item.product._id === p._id
    );

    return item ? item.quantity : 0;

  } /* fin getQuantity */ 
  
  onAddToCart(p: Product): void {
    const quantityToAdd = this.tempQuantities[p._id ?? ''] || 1;
    
    if (this.isInCart(p)) {
      Swal.fire({
        title: '¡Ya está en el carrito!',
        text: `${p.name} ya fue agregado previamente.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    if ( !p._id ) {
      return;
    }
    
    this.cartService.addToCart( p._id, quantityToAdd );

    console.log('🛒 Producto agregado al carrito:', p.name, 'cantidad:', quantityToAdd);
    
    this.tempQuantities[p._id ?? ''] = 1;

    Swal.fire({
      title: '¡Producto agregado!',
      text: `${p.name} agregado al carrito (${quantityToAdd})`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  } /* fin onAddToCart */  
  
  isInCart( p: Product ): boolean {

    const cart = this.cartService.getCartSnapshot();

    if ( !cart ) {
      return false;
    }

    return cart.items.some(
      ( item: { product: Product; quantity: number } ) =>
        item.product._id === p._id
    );

  } /* fin isInCart */
  
  onBuyNow(p: Product): void {
    const quantityToAdd = this.tempQuantities[p._id ?? ''] || 1;

    if (this.isInCart(p)) {
      Swal.fire({
        title: '¡Ya está en el carrito!',
        text: `${p.name} ya fue agregado previamente.`,
        icon: 'info',
        confirmButtonText: 'Ir al carrito'
      }).then(() => {
        this.router.navigate(['/cart']);
      });
      return;
    }

    if ( !p._id ) {
      return;
    }

    this.cartService.addToCart( p._id, quantityToAdd );

    this.tempQuantities[p._id ?? ''] = 1;

    Swal.fire({
      title: 'Compra relámpago',
      text: `${p.name} x${quantityToAdd} agregado(s) al carrito`,
      icon: 'success',
      confirmButtonText: 'Finalizar compra'
    }).then(() => {
      this.router.navigate(['/checkout']);
    });
  } /* fin onBuyNow */  
  
  consoleTest(): void {
    console.log('El boton si responde');
  } /* fin consoleTest */
  
  ngOnDestroy(): void {    
    this.productsSubscription?.unsubscribe();
  } /* fin ngOnDestroy */

  isFavorite(p: Product): boolean { /* <-- ajuste pc#00001 */
    return this.favoriteIds.has(p._id);
  }

  onToggleFavorite(p: Product): void { /* <-- ajuste pc#00001 */
    if (this.isFavorite(p)) {
      this.wishlistService.removeFromWishlist(p._id).subscribe();
    } else {
      this.wishlistService.addToWishlist(p._id).subscribe();
    }
  }
  
} /* fin CardsGroupComponent */