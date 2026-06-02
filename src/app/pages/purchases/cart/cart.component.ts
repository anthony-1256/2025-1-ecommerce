/* cart.component.ts */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cart, CartItem } from '../../../core/models/cart.model'; /* <-- ajuste pc#00003: CartItem */
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, Observable, take } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ RouterModule, CommonModule ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {

  cart$!: Observable<Cart | null>;

  private productsSubscription: Subscription | null = null;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;
  } /* end ngOnInit */

  removeItem(product: Product): void {
    this.cartService
      .removeFromCart(product._id)
      .subscribe();
  } /* end removeItem */

  manualClearCart(): void {
    Swal.fire({
      icon: 'warning',
      title: '¿Vaciar carrito?',
      text: 'Se eliminarán todos los productos del carrito.',
      showCancelButton: true,
      confirmButtonText: 'Sí, vaciar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.cartService.clearCart().subscribe();
        Swal.fire({
          icon: 'success',
          title: 'Carrito vacío',
          text: 'Todos los productos han sido eliminados.'
        });
      }
    });
  } /* end manualClearCart */

  getNumberValue(value: string): number {
    return Number(value);
  } /* end getNumberValue */

  goToCheckout(): void {
    this.cart$
      .pipe(take(1))
      .subscribe((cart) => {
        if (!cart || !cart.items.length) {
          Swal.fire({
            icon: 'info',
            title: 'Carrito vacío',
            text: 'Agrega productos antes de finalizar la compra.'
          });
          return;
        }
        this.router.navigate(['/checkout']);
      });
  } /* end goToCheckout */

  decreaseQuantity(item: CartItem): void { /* <-- ajuste pc#00003 */
    if (item.quantity <= 1) return;
    this.cartService.addToCart(item.product._id, item.quantity - 1).subscribe();
  } /* end decreaseQuantity */

  increaseQuantity(item: CartItem): void { /* <-- ajuste pc#00003 */
    this.cartService.addToCart(item.product._id, item.quantity + 1).subscribe();
  } /* end increaseQuantity */

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  } /* end ngOnDestroy */

} /* fin CartComponent */