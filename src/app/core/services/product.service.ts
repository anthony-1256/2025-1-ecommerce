/***** src/app/core/services/product.service.ts *****/
import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  /* ***** PROPIEDADES INTERNAS ***** */
  /* ar: productos registrados */
  private products: Product[] = [];

  /* ob: observable reactivo del listado de productos */
  private productsSubject = new BehaviorSubject<Product[]>([]);  
  public products$: Observable<Product[]> = this.productsSubject.asObservable();  

  /* ob: producto actualmente seleccionado */
  private currentProduct: Product | null = null;

  /* ob: observable reactivo del producto actual */
  private currentProductSubject = new BehaviorSubject<Product | null>(null);
  public currentProduct$: Observable<Product | null> = this.currentProductSubject.asObservable();

  private readonly productStorageKey = 'products_sync';

  private storageKey = 'products';
  
  /* Referencia temporal al File que pudieraestar en uso */
  private tempImageFile :File | null = null;
    
  /* mt: validacion de archivo */
  private isValidFile(file: any): file is File {
    return !!file && typeof file === 'object' && typeof (file as File).size === 'number';
  }

  /* mt: limpiar referencia temporal de imagen */
  public clearTempImageReference(): void {
    this.tempImageFile = null;
  }

  /* fin propiedades internas */

  /* ***** CONSTRUCTOR ***** */
  constructor() {
    this.loadProductsFromLocalStorage();
    
    /* mt: emitir el estado inicial cargado desde localStorage */
    this.productsSubject.next(this.products);
    
    this.loadCurrentProduct();

    /* cn: sincronizar productos si cambian desde otra pestaña */
    window.addEventListener('storage', (event) => {
      if (event.key === this.productStorageKey) {
        this.loadProductsFromLocalStorage();
        this.productsSubject.next(this.products);
      }
    });
  }
  /* fin constructor */

  /********** MÉTODOS DE REGISTRO **********/
  /* fn: registrar un nuevo producto */
  async register(product: Product, file?: File): Promise<void> {
    this.loadProductsFromLocalStorage();
  
    const usedIds = this.products.map(p => p.idProduct).sort((a, b) => a - b);
    let newId = 1;
    for (let i = 0; i < usedIds.length; i++) {
      if (usedIds[i] !== newId) break;
      newId++;
    }
    product.idProduct = newId;

    /* Normalizar imagen si viene como File -validación segunra */
    if (this.isValidFile(file)) {
      this.tempImageFile = file;
      try {
        product.imgProduct = await this.normalizeImage(file);
      } catch (err) {
        console.error('Error al normalizar imagen en register: ', err);
        /* Evitar sobreescibir con referencia invaálida */
        product.imgProduct = product.imgProduct ?? '';
      } finally {
        /* Limpiar referencia temporal siempre */
        this.tempImageFile = null;
      }      
    } else {
      /* Asegurar que no quede referencia previa */
      this.tempImageFile = null;
    }
    
    this.products.push(product);
    this.saveProductsToLocalStorage();
    this.productsSubject.next(this.products);

    /* notificacion global entre pestañas */
    localStorage.setItem(this.productStorageKey, Date.now().toString());
  } /* fin register */

  /* fn: obtener todos los productos (no reactivo) */
  getAllProducts(): Product[] {
    this.loadProductsFromLocalStorage();
    return this.products;
  } /* fin getAllProducts */

  /* fn: verificar si SKU está duplicado */
  isSkuDuplicate(sku: string): boolean {
    const products = this.getAllProducts();
    return products.some(p => p.sku.toLowerCase() === sku.toLowerCase());
  }
  /* fin isSkuDuplicate */

  /* fn: buscar productos según múltiples filtros combinables */
  filterProducts(filters: Partial<Product>): Product[] {
    return this.products.filter(product =>
      Object.entries(filters).every(([key, value]) => product[key as keyof Product] === value)
    );
  }
  /* fin filterProducts */

  /* fn: obtener el producto seleccionado */
  getCurrentProduct(): Product | null {
    return this.currentProduct;
  }
  /* fin getCurrentProduct */

  /********** MÉTODOS DE ACCESO **********/
  /* mt: obtener producto por ID */
  getProductById(id: number): Product | undefined {
    return this.products.find(p => p.idProduct === id);
  }
  /* fin getProductById */

  /********** MÉTODOS DE ACTUALIZACIÓN **********/
  /* mt: actualizar producto existente por id */
  async updateProduct(updateProduct: Product, file?: File): Promise<void> {
    const index = this.products.findIndex(product => product.idProduct === updateProduct.idProduct);

    /* Normalizar imagen si viene como File - validación segura*/
    if (this.isValidFile(file)) {
      this.tempImageFile = file;
      try {
        updateProduct.imgProduct = await this.normalizeImage(file);
      } catch (err) {
        console.error('Error al normalizar imagen en updateProduct; ', err);
        updateProduct.imgProduct = updateProduct.imgProduct ?? '';
      } finally {
        this.tempImageFile = null;
      }
    } else {
      this.tempImageFile = null;
    }

    if (index !== -1) {
      // Actualizar producto existente
      this.products[index] = { ...updateProduct };
    } else {
      // Agregar producto nuevo
      this.products.push({ ...updateProduct });
    }
    
    // Persistir cambios en localStorage
    this.saveProductsToLocalStorage();

    // Emitir cambios a todos los suscriptores
    this.productsSubject.next([...this.products]);

    // Notificar a otras pestañas que hubo un cambio
    localStorage.setItem(this.productStorageKey, Date.now().toString());
  } /* fin updateProduct */

  /* mt: Actualiza la cantidad disponible de un producto específico */
  updateProductStock(productId: number, quantity: number): void {
    const index = this.products.findIndex(product => product.idProduct === productId);
    if (index !== -1) {
      this.products[index].quantity = quantity;
      this.saveProductsToLocalStorage();
      this.productsSubject.next(this.products);
      localStorage.setItem(this.productStorageKey, Date.now().toString());
    }
  }
  /* fin updateProductStock */

  /* mt: cambia la disponibilidad de un producto específico */
  toggleProductAvailability(productId: number, available: boolean): void {
    const index = this.products.findIndex(product => product.idProduct === productId);
    if (index !== -1) {
      this.products[index].available = available;
      this.saveProductsToLocalStorage();
      this.productsSubject.next(this.products);
      localStorage.setItem(this.productStorageKey, Date.now().toString());
    }
  }
  /* fin toggleProductAvailability */  

  /********** MÉTODOS DE ELIMINACIÓN **********/
  /* mt: eliminar producto por ID */
  deleteProduct(productId: number): void {
    const index = this.products.findIndex(product => product.idProduct === productId);
    
    if (index !== -1) {
      this.products.splice(index, 1);
      this.saveProductsToLocalStorage();
      this.productsSubject.next(this.products);

      /* Limpiar referencia temporal del archivo al eliminar producto */
      this.tempImageFile = null;

      localStorage.setItem(this.productStorageKey, Date.now().toString());
    }
  }
  /* fin deleteProduct */

  /********** MÉTODOS AUXILIARES **********/
  /* fn: generar un id único que no esté ya ocupado */
  generateUniqueProductId(): number {
    const productsFromStorage: Product[] = JSON.parse(localStorage.getItem('products') || '[]');
    const usedIds = new Set(productsFromStorage.map(product => product.idProduct));
    let candidateId = 1;
    while (usedIds.has(candidateId)) {
      candidateId++;
    }
    return candidateId;
  } /* fin generateUniqueProductId */

  /* mt: normalizar imagen a Data URL */
  private async normalizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);


      reader.onerror = (err) => {
        console.error('[ProductService] Error al leer el archivo en normalizeImage: ', err)
        reject(err)
      };
      
      
      reader.readAsDataURL(file); // ✅ Genera "data:image/jpeg;base64,..."
    });
  } /* fin normalizeImage */



  /********** MANEJO DE LOCALSTORAGE **********/
  /* mt: carga los usuarios desde localStorage */
  private loadProductsFromLocalStorage(): void {
    const productsFromStorage = localStorage.getItem('products');
    this.products = productsFromStorage ? JSON.parse(productsFromStorage) : [];    
  }
  /* fin loadProductsFromLocalStorage */

  /* mt: guarda los productos en localStorage */
  private saveProductsToLocalStorage(): void {
    localStorage.setItem('products', JSON.stringify(this.products));
  }
  /* fin saveProductsToLocalStorage */

  /* mt: carga el producto seleccionado desde localStorage */
  private loadCurrentProduct(): void {
    const currentProduct = localStorage.getItem('currentProduct');
    this.currentProduct = currentProduct ? JSON.parse(currentProduct) : null;
    this.currentProductSubject.next(this.currentProduct);
  }
  /* fin loadCurrentProduct */

  /* mt: carga productos desde localStorage (función auxiliar interna) */
  private loadProducts(): void {
    const stored = localStorage.getItem('products');
    this.products = stored ? JSON.parse(stored) : [];    
  }
  /* fin loadProducts */

  /* fn: getCategories */
  getCategories(): string[] {
    const categories = this.products.map(p => p.category);
    return Array.from(new Set(categories));
  } /* fin getCategories */

} /* fin ProductService */