import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';
import { Subject, Subscription } from 'rxjs';
import { Capacity, ProductCategory, Speed } from '../../core/types/enums';
import { CommonModule } from '@angular/common';
import { FormAddproductComponent } from '../forms/form-addproduct/form-addproduct.component';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../core/services/brand.service';
import { Brand } from '../../core/models/brand.model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [ CommonModule, FormsModule, FormAddproductComponent ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  /* ar: errores de validación */
  public errors: string[] = [];

  /* ar: categorías disponibles extraídas del enum ProductCategory */
  public productCategories: string[] = Object.values(ProductCategory);  
  public capacityCategories: string[] = Object.values(Capacity);
  public speedCategories: string[] = Object.values(Speed);

  /* ob: subject reactivo para emitir productos filtrados */
  public productsSubject = new Subject<Product[]>();

  /* ar: observable derivado del subject de productos (renderización) */
  public products$ = this.productsSubject.asObservable();

  /* ar: listado local de productos en inventario */
  public products: Product[] = [];

  /* ob: producto base para creación y edición */
  public newProduct: Product | null = null;

  /* ar: respaldo original de productos sin filtrar */
  private productsOriginal: Product[] = [];

  /* ob: suscripción al observable de productos */
  private productsSubscription: Subscription | null = null;  
  
  /* ob: referencia al listener de storage */
  private storageListener?: (event: StorageEvent) => void;

  public brands: Brand[] = [];
  
  constructor(
    private productService: ProductService,
    private brandService: BrandService
  ) {}  

  /* mt: suscripción al observable products$ y actualización del array local */
  ngOnInit(): void {

    this.loadProducts();

    this.brandService.brands$.subscribe((storeBrands: Brand[]) => {
      this.brands = storeBrands || [];

      this.products.forEach(product => {
        if (product.brand && !product.brand.idBrand) {
          const match = this.brands.find(b => b.name === product.brand.name);
          if (match) product.brand = match;
        }
      });
    });

    this.productsSubscription = this.productService.products$.subscribe({
      next: (products) => {
        this.products = products;
        this.productsOriginal = [...products];

        this.products.forEach(product => {
          if (product.brand && !product.brand.idBrand) {
            const match = this.brands.find(b => b.name === product.brand.name);
            if (match) product.brand = match;
          }
        });

        this.productsSubject.next(this.products);
      }
    });
    /* cn: escuchar cambios en la clave 'products_sync' del localStorage */
    this.storageListener = (event: StorageEvent) => {
      if (event.key === 'products_sync') {
        console.log('Cambio detectado en localStorage para producst_sync'); /**********/
      }
    };
    window.addEventListener('storage', this.storageListener);
  }

  /* mt: se ejecuta al destruir el componente para evitar fugas de memoria */
  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  }

  /* fn: genera un ID único para un nuevo producto sin duplicar existentes */
  private generateProductId(): number {
    const existingIds = this.productsOriginal.map(p => p.idProduct);
    let newId = 1;

    while (existingIds.includes(newId)) {
      newId++;
    }

    return newId;
  }

  /* fn: retoma un producto vacío para inicializar formularios de creación */
  createEmptyProduct(): Product {
    return {
      idProduct: 0,
      imgProduct: '',
      productName: '',
      brand: { idBrand: 0, name:'otra', logo: '' },
      model: '',
      description: '',
      category: ProductCategory.other,
      capacity: Capacity.Other,
      speed: Speed.Other,
      sku: '',
      price: 0,
      quantity: 0,
      available: false
    };
  }

  /* mt: carga los productos existentes desde localStorage o servicio y emite el estado actualizado (renderización) */
  loadProducts(): void {
    
    /* fuerza al servicio a recargar desde localStorage y emitir */
    (this.productService as any).loadProductsFromLocalStorage();    
  }

  /* mt: actualiza los datos de un producto existente */
  updateProduct(updateProduct: Product): void {
    this.productService.updateProduct(updateProduct);
    
    Swal.fire({
      icon: 'success',
      title: 'Producto guardado',
      text: `Los cambios en "${updateProduct.productName}" se han guardado correctamente.`,    
      showConfirmButton: true,
    })
  }

  /* mt: actualiza la cantidad en stock de un producto específico */
  updateStock(idProduct: number, newQuantity: number): void {
    /* cn: busca un producto en la lista local */
    const product = this.products.find(p => p.idProduct === idProduct);
    if (!product) return;

    const updatedProduct: Product = { ...product, quantity: newQuantity };
    this.productService.updateProduct(updatedProduct);    
  }

  /* mt: alterna la disponibilidad del producto (activo/inactivo) */
  toggleAvailability(product: Product): void {
    
    this.productService.toggleProductAvailability(product.idProduct, product.available); /* visibilidad toggle */
  }

  /* mt: cambia la imagen de un producto a partir de un archivo seleccionado */
  onImageChange(product: Product, event: Event): void {
    const input = event.target as HTMLInputElement;

    /* cn: si no hay archivos seleccionados, salir */
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const updatedProduct: Product = {
        ...product,
        imgProduct: reader.result as string
      };

      this.productService.updateProduct(updatedProduct);
    };

    reader.readAsDataURL(file);
  }

  /* mt: filtra productos por un campo específico del modelo Product */
  filterBy(field: keyof Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    /* cn: si no se escribe nada, restaurar productos originales */
    if (!searchTerm) {
      this.productsSubject.next([...this.productsOriginal]);
      return;
    }

    const filtered = this.productsOriginal.filter(product => {
      const fieldValue = product[field];

      /* cn: si el valor del campo es string, hacer comparación */
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(searchTerm);
      }

      /* cn: si el valor es number o boolean, convertir a string */
      if (typeof fieldValue === 'number' || typeof fieldValue === 'boolean') {
        return fieldValue.toString().includes(searchTerm);
      }

      return false;
    });

    this.productsSubject.next(filtered);
  }

  /* mt: filtra productos por categoría */
  filterByCategory(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedCategory = select.value;

    /* cn: si no se selecciona categoría, restaurar todos los productos */
    if (!selectedCategory) {
      this.products = [...this.productsOriginal];
      this.productsSubject.next(this.products);
      return;
    }

    const filtered = this.productService.filterProducts({
      category: selectedCategory as ProductCategory
    });

    this.products = filtered;
    this.productsSubject.next(this.products);
  }

  /* mt: filtra productos comparando todos los campos relevantes con el término de búsqueda */
  filterByAllFields(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    /* cn: si no hay término, restaurar productos originales */
    if (!searchTerm) {
      this.products = [...this.productsOriginal];
      this.productsSubject.next(this.products);
      return;
    }

    const filtered = this.productsOriginal.filter(product => {
      return Object.entries(product).some(([key, value]) => {

        if (
          ['idProduct', 'imgProduct', 'available'].includes(key)
        ) return false;

        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm);
        }

        if (typeof value === 'number' || typeof value === 'boolean') {
          return value.toString().includes(searchTerm);
        }

        return false;
      });
    });

    this.products = filtered;
    this.productsSubject.next(this.products);
  }

  /* mt: elimina un producto del inventario según su ID */
  deleteProduct(idProduct: number): void {
    this.productService.deleteProduct(idProduct);    
  }

  /* mt: abre el modal para agregar un nuevo producto */
  openAddProductModal(): void {
    /* cn: inicializa un nuevo producto vacío */
    this.newProduct = {
      idProduct: this.generateProductId(),
      imgProduct: '',
      productName: '',
      brand: { idBrand: 0, name:'Otra', logo: '' },
      model: '',
      description: '',
      category: ProductCategory.other,
      capacity: Capacity.Other,
      speed: Speed.Other,
      sku: '',
      price: 0,
      quantity: 0,
      available: true,
    };

    /* cn: accede al modal de Bootstrap y lo muestra */
    const modalElement = document.getElementById('addProductModal');
    if (!modalElement) return;

    const modalInstance = (window as any).bootstrap?.Modal?.getOrCreateInstance(modalElement);
    if (modalInstance) modalInstance.show();
  }

  /* mt: registra el producto recibido del componente hijo (renderización) */
  onProductRegistered(newProduct: Product): void {
    const exists = this.productService.getAllProducts().some(p => p.idProduct 
      === newProduct.idProduct);


    /* cn: si no exitse, se registra */
    if (!exists) {

      this.productService.register(newProduct);
    }
  }

  /* fn: actualizar el objeto brand del producto al cambiar select */
  onBrandChange(product: Product, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const selectedId = Number(select.value);

    const selectedBrand =this.brands.find(b => b.idBrand === selectedId);
    if (selectedBrand) {
      product.brand = selectedBrand;
    }
  }

}