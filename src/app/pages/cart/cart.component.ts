import { Component, OnInit, OnDestroy } from '@angular/core';
import { Cart } from '../../core/models/cart.model';
import { CartService } from '../../core/services/cart.service';
import { Product } from '../../core/models/product.model';
import Swal from 'sweetalert2';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, Observable, take } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { PricesService } from '../../core/services/prices.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [ RouterModule, CommonModule ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {

  /* ob: observable del carrito */
  cart$!: Observable<Cart>;

  /* ob: clave actual del carrito en localStorage */
  private storageKey: string = '';
  
  /* ob: suscripción al observable de productos */
  private productsSubscription: Subscription | null = null;
  
  constructor(
    private cartService: CartService,
    private router: Router,
    private productService: ProductService,
    private pricesService: PricesService
  ) {}

  /* mt: ciclo de vida - cargar los items desde el servicio */
  ngOnInit(): void {
    /* cn: obtener clave desde el servicio */
    this.storageKey = this.cartService.getStorageKey();

    /* cn: inicializar observable del carrito */
    this.cart$ = this.cartService.cart$;

    /* cn: escuchar cambios desde otras pestañas */
    window.addEventListener('storage', (event) => {
      if (event.key === this.storageKey) {
        const newCart = JSON.parse(event.newValue || 'null');
        if (newCart) {

          this.cartService.setItems(newCart.items);

        }
      }
    });

    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => {
        this.syncQuantitiesWithInventory(products);
      }
    });
  } /* fin ngOnInit */

  /* mt: sincronizar las cantidades en el carrito en el stock real */
  syncQuantitiesWithInventory(productsFromInventory: Product[]): void {
    let cartUpdated = false;

    const currentCart = this.cartService.getItems();

    currentCart.forEach((item, index) => {
      const matchingProduct = productsFromInventory.find(p => p.idProduct === item.product.idProduct);

      /* cn: producto eliminado del inventario */
      if (!matchingProduct) {
        this.cartService.removeFromCart(item.product);
        cartUpdated = true;
        Swal.fire({
          icon: 'warning',
          title: 'Producto eliminado',
          text: `${item.product.productName} fue eliminado del inventario. Se retiró del carrito.`
        });
        return;
      }

      /* cn: stock actual es menor a la cantidad en carrito */
      if (matchingProduct.quantity < item.quantity) {
        this.cartService.updateQuantityByIndex(
          matchingProduct,
          matchingProduct.quantity,
          index
        );
        cartUpdated = true;
        Swal.fire({
          icon: 'info',
          title: 'Stock actualizado',
          text: `La cantidad de ${item.product.productName} fue ajustada a ${matchingProduct.quantity} debido a cambios en el inventario.`
        });
        return;
      }

      /* cn: stock actual es mayor que la cantidad en carrito */
      if (matchingProduct.quantity > item.quantity) {
        Swal.fire({
          icon: 'info',
          title: 'Stock aumentado',
          text: `El stock de ${item.product.productName} ha aumentado en el inventario. Si deseas, puedes agregar más unidades.`
        });
      }
    });
  }

  /* mt: aumentar cantidad en +1 */
  increaseQuantity(product: Product, index: number): void {
    if (!this.cartService.increaseQuantityByIndex(product, index)) {
      Swal.fire({
        icon: 'info',
        title: 'Stock máximo alcanzado',
        text: 'Ya tienes la cantidad máxima disponible en el carrito.'
      });
    }
  }

  /* mt: disminuir cantidad en -1 */
  decreaseQuantity(index: number): void {
    if (!this.cartService.decreaseQuantityByIndex(index)) {
      Swal.fire({
        icon: 'info',
        title: 'Cantidad mínima alcanzada',
        text: 'No puedes tener menos de una unidad en el carrito.'
      });
    }
  }

  /* mt: eliminar un producto del carrito */
  removeItem(product: Product): void {
    this.cartService.removeFromCart(product);
  }

  /* mt: vaciar completamente el carrito (acción manual del usuario) */
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
        this.cartService.clearCart();
        Swal.fire({
          icon: 'success',
          title: 'Carrito vacío',
          text: 'Todos los productos han sido eliminados.'
        });
      }
    });
  }

  /* fn: extraer el valor numérico del input de manera segura */
  getNumberValue(value: string): number {
    return Number(value);
  }

  /* mt: actualizar la cantidad de un producto */
  updateQuantity(product: Product, quantity: number, index: number): void {
    const stock = product.quantity;

    /* cn: validamos que la cantidad sea válida */
    if (!Number.isInteger(quantity) || quantity < 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cantidad inválida',
        text: 'Debes ingresar una cantidad entera mayor o igual a 1.'
      });
      return;
    }

    /* cn: validación que no se exceda el stock disponible */
    if (quantity > stock) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `Solo hay ${stock} unidades disponibles en stock.`
      });
      return;
    }

    this.cartService.updateQuantityByIndex(product, quantity, index);
  }

  /* mt: redirigir a la vista de checkout si hay productos */
  goToCheckout(): void {
    this.cart$.pipe(take(1)).subscribe(cart => {
      console.log('Carrito actual: ', cart );
      if (!cart.items.length) {
        Swal.fire({
          icon: 'info',
          title: 'Carrito vacío',
          text: 'Agrega productos antes de finalizar la compra.'
        });
        return;
      }
      this.router.navigate(['/checkout']);
    });
  } /* fin goToCheckOut */


  /* fn: obtener el precio total del carrito */
  get totalPrice(): number {

    const items = this.cartService.getItems();
    let total = 0;

    for ( const item of items ) {
      const finalPrice = this.pricesService.getFinalPrice(item.product.idProduct) ?? item.product.price;
      total += item.quantity * finalPrice;
    }


    console.log( 'totalPrice getter ->', {
      items,
      total
    });


    return total;
  } /* fin getTotalPrice */

  /* mt: se ejecuta al destruir el componente para evitar fugas de memoria */
  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }
}
