/* src/app/pages/card-view/card-view.component.ts */
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Product } from '../../core/models/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { ProductService } from '../../core/services/product.service';
import { SalesService } from '../../core/services/sales.service';
import { CartService } from '../../core/services/cart.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { AuthService } from '../../core/services/auth.service';
import Swal from 'sweetalert2';
import { PricesService } from '../../core/services/prices.service';
import { Favorite } from '../../core/models/favorites.model';

@Component({
  selector: 'app-card-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './card-view.component.html',
  styleUrl: './card-view.component.css'
})
export class CardViewComponent implements OnInit, OnDestroy {

  /* ***** PROPIEDADES ***** */
  product!: Product;
  quantity: number = 1;
  recomendedProducts: Product[] = [];
  cartQuantity: number = 0;
  private cartSubscription: Subscription | null = null;

  favoritesList: Favorite[] = [];  
  private favoritesSubscription: Subscription | null = null;

  /* ***** PROPIEDADES DE FAVORITOS */
  favorites$!: Observable<Favorite[]>;
  private favoriteIds: Set<number> = new Set();
  private storageListener!: (event: StorageEvent) => void;
  private favoriteSubscription: Subscription | null = null;

  /* ***** PROPIEDADES DE CARRITO ***** */
  tempQuantities: { [id: number]: number } = {};  

  /* ***** FLAGS DE UI / ESTADO ***** */
  isLoading: boolean = false;


  /* ***** CONSTRUCTOR ***** */
  constructor(
    private productService: ProductService,
    private salesService: SalesService,
    private cartService: CartService,
    private favoritesService: FavoritesService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private pricesService: PricesService,
    private cd: ChangeDetectorRef
  ) {} /* fin Constructor */


  /* ***** CICLO DE VIDA ***** */
  ngOnInit(): void {
    this.isLoading = true;

    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));      
      if (id) {
        this.isLoading = true;        
        setTimeout(() => {
          const found = this.productService.getProductById(id);
          if (found) {
            this.product = found;
            this.loadRecommendedProducts();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            console.warn('[] Producto no encontrado para id:', id);
          }
          this.isLoading = false;
        }, 500);
      }      
    });
    
    this.cartSubscription = this.cartService.cart$.subscribe(cart => {
      this.cartQuantity = cart.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
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
    this.cartSubscription?.unsubscribe();
    this.favoritesSubscription?.unsubscribe();

    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  } /* fin ngOnDestroy */  
  
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
  
  
  /* ***** MÉTODOS DE PRODUCTOS RECOMENDADOS ***** */
  /* mt: loadRecommendedProducts */
  private async loadRecommendedProducts(): Promise<void> {
    if (!this.product) return;
    const allSales = await firstValueFrom(this.salesService.sales$);

    const groupedSales: Record<number, { productId: number, quantitySold: number }> = {};
    for (const sale of allSales) {
      const pid = sale.idProduct;
      if (!groupedSales[pid]) {
        groupedSales[pid] = { productId: pid, quantitySold: sale.quantity };
      } else {
        groupedSales[pid].quantitySold += sale.quantity;
      }
    }

    const topSoldProducts = Object.values(groupedSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .map(g => this.productService.getProductById(g.productId))
      .filter((p): p is Product => !!p && p.idProduct !== this.product.idProduct);

    const sameBrand = this.productService.getAllProducts()
      .find(p => p.brand?.idBrand === this.product.brand?.idBrand && p.idProduct !== this.product.idProduct);

    const sameCategory = this.productService.getAllProducts()
      .find(p => p.category === this.product.category && p.idProduct !== this.product.idProduct && p !== sameBrand);

    const topSold = topSoldProducts.find(p => p !== sameBrand && p !== sameCategory);
    this.recomendedProducts = [];
    if (sameBrand) this.recomendedProducts.push(sameBrand);
    if (sameCategory) this.recomendedProducts.push(sameCategory);
    if (topSold) this.recomendedProducts.push(topSold);
    console.log('[DEBUG][CardView] recomendedProducts:', this.recomendedProducts);
  } /* fin loadRecommendedProducts */

  /* fn: enrichedProduct */
  public get enrichedProduct(): { product: Product; lastPrice?: number; hasDiscount?: boolean } {
    const lastPrice = this.pricesService.getLastPrice(this.product.idProduct);
    const hasDiscount = this.pricesService.isPercentageDiscount(this.product.idProduct);
    return { product: this.product, lastPrice, hasDiscount };
  } /* fin enrichedProduct */

  /* fn: enrichedRecommendedProducts */
  public get enrichedRecommendedProducts(): { product: Product; lastPrice?: number; hasDiscount?: boolean }[] {
    return this.recomendedProducts.map(p => {
      const lastPrice = this.pricesService.getLastPrice(p.idProduct);
      const hasDiscount = this.pricesService.isPercentageDiscount(p.idProduct);
      return { product: p, lastPrice, hasDiscount };
    });
  } /* fin enrichedRecommendedProducts */
  
  /* mt: open */
  open(product: Product): void {
    this.product = product;
    this.quantity = 1;
    this.loadRecommendedProducts();
    const modalElement = document.getElementById('cardViewModal');
    if (modalElement) {
      const modalInstance = (window as any).bootstrap.Modal.getOrCreateInstance(modalElement);
      modalInstance.show();
    }
  } /* fin open */

  /* mt: goToProduct */
  public goToProduct(idProduct: number): void {
    this.isLoading = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.router.navigate(['/detalles', idProduct]);
  } /* fin goToProducts */

} /* fin CardsGroupComponent */