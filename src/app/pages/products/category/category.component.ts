/* category.component.ts */
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Router, RouterLink } from '@angular/router';
import { Product } from '../../../core/models/product.model';


import { Subscription } from 'rxjs';
import { CartService } from '../../../core/services/cart.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-category',
  imports: [ CommonModule, RouterLink ],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css'
})
export class CategoryComponent implements OnInit {

  filteredProducts: Product[] = [];
  categoryName: string = '';
  
  @Input() isVisible: boolean = true;
  @Input() products: Product[] = [];
  
  product!: Product;
  visibleProducts: Product[] = [];
  recomendedProducts: Product[] = [];
  
  tempQuantities: { [ id: string ]: number } = {};
  
  private storageListener!: (event: StorageEvent) => void;
  
  private productsSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;
  
  /* ***** FLAGS DE UI / ESTADO ***** */
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private productService: ProductService,    
    private cartService: CartService,
    private cd: ChangeDetectorRef,
    private router: Router) {}

  /* ***** CICLO DE VIDA category.component.ts ***** */
  /* mt: ngOnInit */  
  ngOnInit(): void {
    // 1) loader al inicio
    this.isLoading = true;

    // 2) obtener categoría desde query params (tu código conservado)
    const url = this.router.url;
    const parts = url.split('?category=');

    if (parts.length > 1) {
      this.categoryName = decodeURIComponent(parts[1]);
    }

    // 3) construir filteredProducts inicial (filtrando también stock > 0)
    this.filteredProducts = this.products
      .filter((p: Product) => p.category.name === this.categoryName && p.quantity > 0); /* <-- ajuste pc#00002 */

    // 4) suscribirse al observable de productos para sincronización de stock
    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => this.syncQuantitiesWithInventory(products)
    });

    // 7) Simular small loader igual a cards-group
    setTimeout(() => { this.isLoading = false; }, 500);
  } /* fin ngOnInit */

  /* mt: ngOnDestroy */
  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();    


    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  } /* fin ngOnDestroy */

  /* ***** MÉTODOS DE SINCRONIZACIÓN ***** */
  /* mt: syncQuantitiesWithInventory */
  private syncQuantitiesWithInventory(products: Product[]): void {
    // ✅ Actualiza solo los productos de la categoría activa y con stock disponible
    this.filteredProducts = products.filter((p: Product) =>
      p.category.name === this.categoryName && p.quantity > 0
    ); /* <-- ajuste pc#00002 */

    console.log(`[Category] Inventario sincronizado (${this.categoryName}):`, this.filteredProducts.length);
  } /* fin syncQuantitiesWithInventory */

  /* ***** MÉTODOS DE CANTIDAD TEMPORAL ***** */
  /* mt: increaseQuantity */
  increaseQuantity(p: Product): void {
    const id = p._id;
    this.tempQuantities[id] = (this.tempQuantities[id] || 1) + 1;
    console.log(`Cantidad temporal aumentada para ${p.name}:`, this.tempQuantities[id]);
  } /* fin increaseQuantity */

  /* mt: decreaseQuantity */
  decreaseQuantity(p: Product): void {
    const id = p._id;
    if ((this.tempQuantities[id] || 1) > 1) {
      this.tempQuantities[id]--;
      console.log(`Cantidad temporal disminuida para ${p.name}:`, this.tempQuantities[id]);
    }
  } /* fin decreaseQuantity */

  getTotal(p: Product): number { /* <-- ajuste pc#00002 */
    const tempQty = this.tempQuantities[p._id];
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return (tempQty || 1) * p.price;
    const item = cart.items.find(
      (i: { product: Product; quantity: number }) => i.product._id === p._id
    );
    const quantity = tempQty !== undefined ? tempQty : (item ? item.quantity : 1);
    return quantity * p.price;
  } /* fin getTotal */

  getQuantity(p: Product): number { /* <-- ajuste pc#00002 */
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return 0;
    const item = cart.items.find(
      (i: { product: Product; quantity: number }) => i.product._id === p._id
    );
    return item ? item.quantity : 0;
  } /* fin getQuantity */


  /* ***** MÉTODOS DE CARRITO ***** */
  /* mt: onAddToCart */
  onAddToCart(p: Product): void {
    const quantityToAdd = this.tempQuantities[p._id] || 1;

    if (this.isInCart(p)) {
      Swal.fire({
        title: '¡Ya está en el carrito!',
        text: `${p.name} ya fue agregado previamente.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.cartService.addToCart(p._id, quantityToAdd);
    console.log('🛒 Producto agregado al carrito:', p.name, 'cantidad:', quantityToAdd);

    // Reset cantidad temporal a 1
    this.tempQuantities[p._id] = 1;

    Swal.fire({
      title: '¡Producto agregado!',
      text: `${p.name} agregado al carrito (${quantityToAdd})`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  } /* fin onAddToCart */

  isInCart(p: Product): boolean { /* <-- ajuste pc#00002 */
    const cart = this.cartService.getCartSnapshot();
    if (!cart) return false;
    return cart.items.some(
      (item: { product: Product; quantity: number }) => item.product._id === p._id
    );
  } /* fin isInCart */

  /* mt: onBuyNow - compra relámpago con validación */
  onBuyNow(p: Product): void {
    const quantityToAdd = this.tempQuantities[p._id] || 1;

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

    this.cartService.addToCart(p._id, quantityToAdd);

    this.tempQuantities[p._id] = 1;

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
  
  closeCategory(): void {
    // redirige al componente principal de productos
    this.router.navigate(['/productos']);
  } /* fin closeCategory */

}
