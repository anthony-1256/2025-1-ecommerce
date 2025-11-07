/* src/app/pages/cards-group/cards-group.component.ts */
import { ChangeDetectorRef, Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { PricesService } from '../../core/services/prices.service';
import { Subscription, Observable } from 'rxjs';
import { Favorite } from '../../core/models/favorites.model';

@Component({
  selector: 'app-cards-group',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cards-group.component.html',
  styleUrl: './cards-group.component.css'
})
export class CardsGroupComponent implements OnInit, OnDestroy{

  /* ***** INPUTS ***** */
  @Input() isVisible: boolean = true;
  @Input() products: Product[] = [];

  /* ***** PROPIEDADES DE PRODUCTOS ***** */
  product!: Product;
  visibleProducts: Product[] = [];
  recomendedProducts: Product[] = [];

  /* ***** PROPIEDADES DE CARRITO ***** */
  tempQuantities: { [id: number]: number } = {};  
  
  /* ***** PROPIEDADES DE FAVORITOS */
  favorites$!: Observable<Favorite[]>;
  private favoriteIds: Set<number> = new Set();
  private storageListener!: (event: StorageEvent) => void;
  private favoriteSubscription: Subscription | null = null;

  /* ***** SUSCRIPCIONES / OBSERVABLES ***** */
  private productsSubscription: Subscription | null = null;
  private cartSubscription: Subscription | null = null;
  
  /* ***** FLAGS DE UI / ESTADO ***** */
  isLoading: boolean = false;
  
  
  /* ***** SERVICIOS ***** */
  private productService = inject(ProductService);
  public cartService = inject(CartService);
  private router = inject(Router);
  private authService = inject(AuthService);
  public pricesService = inject(PricesService);
  private favoritesService = inject(FavoritesService);
  private cd = inject(ChangeDetectorRef);
  cart$ = this.cartService.cart$;

  /* ***** CICLO DE VIDA cards.component.ts ***** */
  /* mt: ngOnInit */  
  ngOnInit(): void {
    this.isLoading = true;

    /* cn: filtrar productos con stock disponible */
    this.visibleProducts = this.products.filter(p => p.quantity > 0);

    /* cn: suscribirse al observable de productos para sincronización de stock*/
    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => this.syncQuantitiesWithInventory(products)
    });
    
    this.favoriteSubscription = this.favoritesService.favorites$.subscribe((favs: Favorite[]) => {
      this.favoriteIds = new Set(favs.map( f => f.idProduct ));
      console.log('[CardsGroup] Favoritos actualizados:', Array.from(this.favoriteIds));
      this.cd.detectChanges();
    });

    this.storageListener = (event: StorageEvent) => {
      if (event.key === this.favoritesService.getStorageKey()) {
        this.favoritesService.reloadFavoritesFromStorage();
      }
    };
    window.addEventListener('storage', this.storageListener);

    setTimeout(() => { this.isLoading = false; }, 500);
  } /* fin ngOnInit */

  /* mt: ngOnDestroy */
  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();    
    this.favoriteSubscription?.unsubscribe();

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  } /* fin ngOnDestroy */


  /* ***** MÉTODOS DE SINCRONIZACIÓN ***** */
  /* mt: syncQuantitiesWithInventory */
  private syncQuantitiesWithInventory(products: Product[]): void {
      this.visibleProducts = products.filter(p => p.quantity > 0);
      console.log('Inventario sincronizado. Productos visibles:', this.visibleProducts.length);
  } /* fin syncQuantitiesWithInventory */

  /* ***** MÉTODOS DE CANTIDAD TEMPORAL ***** */
  /* mt: increaseQuantity */
  increaseQuantity(p: Product): void {
    const id = p.idProduct;
    this.tempQuantities[id] = (this.tempQuantities[id] || 1) + 1;
    console.log(`Cantidad temporal aumentada para ${p.productName}:`, this.tempQuantities[id]);
  } /* fin increaseQuantity */

  /* mt: decreaseQuantity */
  decreaseQuantity(p: Product): void {
    const id = p.idProduct;
    if ((this.tempQuantities[id] || 1) > 1) {
      this.tempQuantities[id]--;
      console.log(`Cantidad temporal disminuida para ${p.productName}:`, this.tempQuantities[id]);
    }
  } /* fin decreaseQuantity */

  /* mt: getTotal */
  getTotal(p: Product): number {
    const tempQty = this.tempQuantities[p.idProduct];
    const cart = this.cartService.getCartSnapshot;
    const item = cart.items.find((i: any) => i.product.idProduct === p.idProduct);

    const quantity = tempQty !== undefined ? tempQty : (item ? item.quantity : 1);    
    return quantity * p.price;
  } /* fin getTotal */

  /* mt: getQuantity */
  getQuantity(p: Product): number {
    const cart = this.cartService.getCartSnapshot;
    const item = cart.items.find(i => i.product.idProduct === p.idProduct);
    return item ? item.quantity : 0;
  } /* fin getQuantity */


  /* ***** MÉTODOS DE CARRITO ***** */
  /* mt: onAddToCart */
  onAddToCart(p: Product): void {
    const quantityToAdd = this.tempQuantities[p.idProduct] || 1;

    if (this.isInCart(p)) {
      Swal.fire({
        title: '¡Ya está en el carrito!',
        text: `${p.productName} ya fue agregado previamente.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    this.cartService.addToCart(p, quantityToAdd);
    console.log('🛒 Producto agregado al carrito:', p.productName, 'cantidad:', quantityToAdd);

    // Reset cantidad temporal a 1
    this.tempQuantities[p.idProduct] = 1;

    Swal.fire({
      title: '¡Producto agregado!',
      text: `${p.productName} agregado al carrito (${quantityToAdd})`,
      icon: 'success',
      confirmButtonText: 'Aceptar'
    });
  } /* fin onAddToCart */

  /* fn: isInCart */  
  isInCart(p: Product): boolean {
    const cart = this.cartService.getCartSnapshot;
    return cart.items.some((item: {product: Product, quantity: number}) => item.product.idProduct === p.idProduct);
  } /* fin isInCart */

  /* mt: onBuyNow - compra relámpago con validación */
  onBuyNow(p: Product): void {
    const quantityToAdd = this.tempQuantities[p.idProduct] || 1;

    if (this.isInCart(p)) {
      Swal.fire({
        title: '¡Ya está en el carrito!',
        text: `${p.productName} ya fue agregado previamente.`,
        icon: 'info',
        confirmButtonText: 'Ir al carrito'
      }).then(() => {
        this.router.navigate(['/cart']);
      });
      return;
    }

    this.cartService.addToCart(p, quantityToAdd);

    this.tempQuantities[p.idProduct] = 1;

    Swal.fire({
      title: 'Compra relámpago',
      text: `${p.productName} x${quantityToAdd} agregado(s) al carrito`,
      icon: 'success',
      confirmButtonText: 'Finalizar compra'
    }).then(() => {
      this.router.navigate(['/checkout']);
    });
  } /* fin onBuyNow */

  
  /* ***** MÉTODOS DE FAVORITOS***** */
  /* mt: onToggleFavorite */
  onToggleFavorite(p: Product): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      Swal.fire({
        title: 'Debes iniciar sesión',
        text: 'Para agregar productos a favoritos, necesitas estar logueado.',
        icon: 'warning',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
    const fav: Favorite = {
      idProduct: p.idProduct,
      idUser: user.idUser,
      name: p.productName,
      image: p.imgProduct,
      price: p.price
    };    
    const alreadyFavorite = this.favoritesService.isFavorite(p.idProduct);
    console.log('💡 Estado actual desde servicio:', alreadyFavorite);
    if (alreadyFavorite) {
      console.log('Eliminado de favoritos:', p.productName);
      this.favoritesService.deleteAllFavoritesByUser(fav.idProduct);
      this.favoriteIds.delete(fav.idProduct);
      Swal.fire({
        title: 'Producto eliminado',
        text: `${p.productName} se eliminó de tus favoritos.`,
        icon: 'info',
        confirmButtonText: 'Aceptar'
      });
    } else {
      console.log('Agregado a favoritos:', p.productName);
      this.favoritesService.createFavoritesByUser(fav);
      this.favoriteIds.add(fav.idProduct);
      Swal.fire({
        title: 'Producto agregado',
        text: `${p.productName} se agregó a tus favoritos.`,
        icon: 'success',
        confirmButtonText: 'Aceptar'
      });
    }
    console.log('[CardsGroup] Estado actualizado:', this.favoritesService.isFavorite(p.idProduct));
  } /* fin onToggleFavorite */
  
  /* mt: isFavorite */
  public isFavorite(p: Product): boolean {
    return this.favoriteIds.has(p.idProduct);
  } /* fin isFavorite */

  /* ***** MÉTODOS DE PRUEBA ***** */
  /* mt: consoleTest */
  consoleTest(): void {
    console.log('El boton si responde');
  } /* fin consoleTest */

} /* fin CardsGroupComponent */

/*
  signal
  event Emiter con Output
*/