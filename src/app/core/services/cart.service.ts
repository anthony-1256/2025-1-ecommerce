/***** src/app/core/services/cart.service.ts *****/
import { Injectable } from '@angular/core';
import { Cart, CartItem } from '../models/cart.model';
import { BehaviorSubject, Observable, Subscription, fromEvent } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { User } from '../models/user.model';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { PricesService } from './prices.service';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  /* ***** PROPIEDADES ***** */
  /* ob: carrito actual del usuario */
  private cart!: Cart;

  /* ob: estado reactivo del carrito */
  private cartSubject = new BehaviorSubject<Cart>(this.cart);
  cart$ = this.cartSubject.asObservable();
  get getCartSnapshot() {
    return this.cartSubject.getValue();
  }

  /* ob: clave de localStorage construida dinámicamente por usuario */
  private storageKey: string = '';

  /* ob: suscripción activa a productos reactivos (opcional) */
  private productSub!: Subscription;

  /* ob: usuario actual del sistema */
  private currentUser: User | null = null;

  private storageSync$!: Observable<Cart>;

  /* ***** CONSTRUCTOR ***** */
  constructor(
    private authService: AuthService,
    private productService: ProductService,
    private pricesService: PricesService
  ) {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) return;

    const prefix = this.currentUser.admin ? 'cart_admin' : 'cart_user';
    this.storageKey = `${prefix}${this.currentUser.idUser.toString()}`;

    const stored = localStorage.getItem(this.storageKey);

    this.cart = stored
      ? JSON.parse(stored)
      : {
          idCart: crypto.randomUUID(),
          idUser: String(this.currentUser!.idUser),
          items: []
        };

    // inicializar BehaviorSubject con el carrito cargado
    this.cartSubject = new BehaviorSubject<Cart>(this.cart);
    this.cart$ = this.cartSubject.asObservable();

    this.syncCartItems();

    // 🔄 Sincronización multi-pestaña
    this.storageSync$ = fromEvent<StorageEvent>(window, 'storage').pipe(
      filter(event => event.key === this.storageKey && !!event.newValue),
      map(event => JSON.parse(event.newValue!) as Cart)
    );

    this.storageSync$.subscribe((newCart: Cart) => {
      this.cart = newCart;
      this.cartSubject.next(newCart);
    });

    // 🔔 Listener existente para productos
    window.addEventListener('storage', (event) => {
      if (event.key === 'productUpdated') {
        this.syncCartItems();
      }
    });
  } /* fin Constructor */
  

  /* ***** MÉTODOS DE ACCESO ***** */
  /* mt: getCart */
  getCart(): Cart {
    return this.cart;    
  } /* fin getCart */

  /* mt: getItems */
  getItems(): CartItem[] {
    return this.cart.items;
  } /* fin getItems */

  /* mt: getTotalQuantity */
  getTotalQuantity(): number {
    return this.cart.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  } /* fin getTotalQuantity */

  /* mt: getTotalPrice */
  getTotalPrice(): number {

    // 🔹 DEBUG: mostrar cada producto con precio final y cantidad
    console.log('[DEBUG totalPrice]', this.cart.items.map(item => ({
      id: item.product.idProduct,
      name: item.product.productName,
      finalPrice: this.pricesService.getFinalPrice(item.product.idProduct),
      quantity: item.quantity
    })));

    return this.cart.items.reduce((sum, item) => {
      const finalPrice = this.pricesService.getFinalPrice(item.product.idProduct) ?? 0;
      const quantity = item.quantity ?? 1;
      return sum + (finalPrice * quantity);
    }, 0);
  } /* fin getTotalPrice */


  /* mt: getStorageKey */
  getStorageKey(): string {
    return this.storageKey;
  } /* fin getStorageKey */

  /* ***** MODIFICACIÓN DE ITEMS ***** */
  /* mt: addToCart */
  addToCart(product: Product, quantity: number = 1): void {

    // 1️⃣ Clonar los items actuales para evitar mutaciones directas
    const newItems: CartItem[] = [...this.cart.items];

    // 2️⃣ Buscar si el producto ya existe en el carrito
    const existingIndex = newItems.findIndex(item => item.product.idProduct === product.idProduct);

    if (existingIndex !== -1) {
      // Producto ya existe, sumar cantidades pero respetando stock
      const currentQty = newItems[existingIndex].quantity ?? 1;
      const maxStock = product.quantity;
      newItems[existingIndex].quantity = Math.min(currentQty + quantity, maxStock);
    } else {
      // Producto nuevo, agregar solo si hay stock suficiente
      if (product.quantity >= quantity) {
        newItems.push({ product, quantity });
      }
    }

    // 3️⃣ Crear un nuevo objeto Cart para romper referencias
    const newCart: Cart = {
      ...this.cart,
      items: newItems,
      totalQuantity: newItems.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
      totalPrice: newItems.reduce((sum, item) => {
        const finalPrice = this.pricesService.getFinalPrice(item.product.idProduct) ?? 0;
        return sum + ((item.quantity ?? 1) * finalPrice);
      }, 0)
    };

    // 4️⃣ Guardar en localStorage y notificar suscriptores
    localStorage.setItem(this.storageKey, JSON.stringify(newCart));
    this.cartSubject.next(newCart);

    // 5️⃣ Actualizar referencia interna
    this.cart = newCart;
  } /* fin addToCart */

  /* mt: removeFromCart */
  removeFromCart(product: Product): void {
    
    // Crear un nuevo array sin el producto
    const newItems: CartItem[] = this.cart.items.filter(item => item.product.idProduct !== product.idProduct);

    // Crear un nuevo carrito limpio
    const newCart: Cart = { ...this.cart, items: [...newItems] };

    // Guardar en localStorage y notificar suscriptores
    localStorage.setItem(this.storageKey, JSON.stringify(newCart));
    this.cartSubject.next(newCart);

    // Actualizar referencia interna
    this.cart = newCart;
    
  } /* fin removeFromCart */

  /* mt: updateQuantityByIndex */
  updateQuantityByIndex(product: Product, index: number, quantity: number): void {
    if (quantity < 1 || quantity > product.quantity) return;

    const item = this.cart.items[index];
    if (!item || item.product.idProduct !== product.idProduct) return;

    const totalOtherQty = this.cart.items
      .filter((_, i) => i !== index && item.product.idProduct === product.idProduct)
      .reduce((sum, it) => sum + (it.quantity ?? 1), 0);

    const newTotal = totalOtherQty + quantity;
    if (newTotal > product.quantity) return;

    this.cart.items[index].quantity = quantity;
    this.saveCart();
  } /* fin updateQuantityByIndex */

  /* mt: increaseQuantityByIndex */
  increaseQuantityByIndex(product: Product, index: number): boolean {
    const item = this.cart.items[index];
    if (!item) return false;
    const currentStock = product.quantity;
    if ((item.quantity ?? 1) >= currentStock) return false;
    item.quantity = (item.quantity ?? 1) + 1;
    this.saveCart();
    return true;
  } /* fin increaseQuantityByIndex */

  /* mt: decreaseQuantityByIndex */
  decreaseQuantityByIndex(index: number): boolean {
    const item = this.cart.items[index];
    if (!item) return false;
    if ((item.quantity ?? 1) <= 1) return false;
    item.quantity = (item.quantity ?? 1) - 1;
    this.saveCart();
    return true;
  } /* fin decreaseQuantityByIndex */

  /* mt: setItems */
  setItems(items: CartItem[]): void {
    
    if (!Array.isArray(items)) {
      console.error('🚨 setItems recibió algo no iterable:', items);
      return;
    }

    /* Map para controlar cantidades únicas pro producto */
    const uniqueItems: Map<number, number> = new Map();

    for (const item of items) {
      const id = item.product.idProduct;
      const stock = item.product.quantity;
      const existingQty = uniqueItems.get(id) ?? 0;
      const newTotal = existingQty + (item.quantity ?? 1);

      if (newTotal > stock) continue;

      uniqueItems.set(id, newTotal);
    }

    // Generar array final de items
    const mergedItems: CartItem[] = Array.from(uniqueItems.entries()).map(([idProduct, quantity]) => {
      const originalItem = items.find(i => i.product.idProduct === idProduct)!;      
      return { product: originalItem.product, quantity };
    });

    // Asignar items al carrito
    this.cart.items = mergedItems;

    // 🔍 DEBUG: verificar datos base antes del cálculo
    console.log('[DEBUG PRICE CALC]', mergedItems.map(i => ({
      id: i.product?.idProduct,
      name: i.product?.productName,
      price: i.product?.price,
      qty: i.quantity
    })));

     // Recalcular totales
    this.cart.totalQuantity = mergedItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0);
    this.cart.totalPrice = mergedItems.reduce((sum, item) => {

      const finalPrice = this.pricesService.getFinalPrice(item.product.idProduct)
        ?? item.product.price
        ?? 0;
      
      console.log('[DEBUG getFinalPrice]', item.product.idProduct, finalPrice);

      return sum + ((item.quantity ?? 0) * finalPrice);
    }, 0);

    // 🔹 DEBUG: confirmar que los cálculos son correctos
    console.log('✅ setItems - totalQuantity y totalPrice recalculados:', {
      totalQuantity: this.cart.totalQuantity,
      totalPrice: this.cart.totalPrice
    });

    console.log('[DEBUG emit cart]', this.cart.totalQuantity, this.cart.totalPrice);

    // 🔹 Notificar a todos los suscriptores del BehaviorSubject
    this.cartSubject.next(this.cart);

    this.saveCart();
  } /* fin setItems */


  /* mt: clearCart */
  clearCart(): void {

    // Crear un carrito totalmente nuevo con items vacío
    const newCart: Cart = { ...this.cart, items: [] };

    // Guardar en localStorage y notificar
    localStorage.setItem(this.storageKey, JSON.stringify(newCart));
    this.cartSubject.next(newCart);

    // Actualizar referencia interna
    this.cart = newCart;

  } /* fin clearCart */

  /* ***** MÉTODOS INTERNOS / PRIVADOS ***** */
  private saveCart(): void {
    console.log('[saveCart] Guardando carrito...');
    console.log('[saveCart] this.cart antes de guardar:', this.cart);

    // Clonar carrito para romper referencias
    const cartToSave: Cart = { ...this.cart, items: [...this.cart.items] };
    localStorage.setItem(this.storageKey, JSON.stringify(cartToSave));

    // Notificar a todos los suscriptores con el clon
    this.cartSubject.next(cartToSave);

    console.log('[saveCart] Contenido en localStorage:', localStorage.getItem(this.storageKey));
    console.log('[saveCart] Notificación enviada a cartSubject con:', cartToSave);

    // Actualizar referencia interna
    this.cart = cartToSave;
  } /* fin saveCart */

  /* mt: syncCartItems */
  private syncCartItems(): void {
    const products = this.productService.getAllProducts();
    this.cart.items = this.cart.items.filter(item =>
      products.some(p => p.idProduct === item.product.idProduct)
    );
    this.saveCart();
  } /* fin syncCartItems */

} /* fin CartService */
