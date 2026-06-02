/* inventory.component.ts */
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../../core/services/product.service';
import { Subject, Subscription } from 'rxjs';
import { Capacity, ProductCategory, Speed } from '../../../core/types/enums';
import { CommonModule } from '@angular/common';
import { FormAddproductComponent } from '../../../pages/products/form-addproduct/form-addproduct.component';
import { FormsModule } from '@angular/forms';
import { BrandService } from '../../../core/services/brand.service';
import { Brand } from '../../../core/models/brand.model';
import { Product } from '../../../core/models/product.model'; /* <-- ajuste pc#00003 */
import { Category } from '../../../core/models/category.model'; /* <-- ajuste pc#00003 */
import Swal from 'sweetalert2';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    FormAddproductComponent
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.css'
})
export class InventoryComponent implements OnInit {

  public errors: string[] = [];

  public productCategories: string[] = Object.values(ProductCategory);
  public capacityCategories: string[] = Object.values(Capacity);
  public speedCategories: string[] = Object.values(Speed);

  public productsSubject = new Subject<Product[]>();
  public products$ = this.productsSubject.asObservable();
  public products: Product[] = [];
  public newProduct: Product | null = null;
  private productsOriginal: Product[] = [];
  private productsSubscription: Subscription | null = null;
  private storageListener?: (event: StorageEvent) => void;
  public brands: Brand[] = [];
  
  constructor(
    private productService: ProductService,
    private brandService: BrandService
  ) {}  

  ngOnInit(): void {
    this.loadProducts();

    this.brandService.brands$.subscribe((storeBrands: Brand[]) => {
      this.brands = storeBrands || [];
    }); /* <-- ajuste pc#00003: eliminado acceso a brand.brand._id */

    this.productsSubscription = this.productService.products$.subscribe({
      next: (products: Product[]) => { /* <-- ajuste pc#00003 */
        this.products = products;
        this.productsOriginal = [...products];
        this.productsSubject.next(this.products);
      }
    }); /* <-- ajuste pc#00003: eliminado acceso a brand.brand._id */

    this.storageListener = (event: StorageEvent) => {
      if (event.key === 'products_sync') {
        console.log('Cambio detectado en localStorage para products_sync');
      }
    };
    window.addEventListener('storage', this.storageListener);
  } /* end ngOnInit */

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
    if (this.storageListener) {
      window.removeEventListener('storage', this.storageListener);
    }
  } /* end ngOnDestroy */

  createEmptyProduct(): Product { /* <-- ajuste pc#00003 */
    const emptyCategory: Category = { _id: '', name: '', description: '', imageURL: '', parentCategory: null };
    const emptyBrand: Brand = { _id: '', name: '', logo: '' };
    return {
      _id: '',
      imageURL: '',
      name: '',
      brand: emptyBrand,
      model: '',
      description: '',
      category: emptyCategory,
      capacity: Capacity.Other,
      speed: Speed.Other,
      sku: '',
      price: 0,
      quantity: 0,
      available: false
    };
  } /* end createEmptyProduct */

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products: Product[]) => { /* <-- ajuste pc#00003 */
        this.products = products;
        this.productsOriginal = [...products];
        this.productsSubject.next(this.products);
      }
    });
  } /* end loadProducts */

  updateProduct(product: Product): void { /* <-- ajuste pc#00003 */
    this.productService.updateProduct(product._id, product).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'Producto guardado',
          text: `Los cambios en "${product.name}" se han guardado correctamente.`,
          showConfirmButton: true,
        });
      }
    });
  } /* end updateProduct */

  updateStock(_id: string, newQuantity: number): void { /* <-- ajuste pc#00003 */
    const product = this.products.find(p => p._id === _id);
    if (!product) return;
    const updatedProduct: Product = { ...product, quantity: newQuantity };
    this.productService.updateProduct(_id, updatedProduct).subscribe();
  } /* end updateStock */

  toggleAvailability(product: Product): void { /* <-- ajuste pc#00003 */
    const updatedProduct: Product = { ...product, available: !product.available };
    this.productService.updateProduct(product._id, updatedProduct).subscribe();
  } /* end toggleAvailability */

  onImageChange(product: Product, event: Event): void { /* <-- ajuste pc#00003 */
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      const updatedProduct: Product = {
        ...product,
        imageURL: reader.result as string /* <-- ajuste pc#00003: image → imageURL */
      };
      this.productService.updateProduct(product._id, updatedProduct).subscribe();
    };

    reader.readAsDataURL(file);
  } /* end onImageChange */

  filterBy(field: keyof Product, event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    if (!searchTerm) {
      this.productsSubject.next([...this.productsOriginal]);
      return;
    }

    const filtered = this.productsOriginal.filter(product => {
      const fieldValue = product[field];
      if (typeof fieldValue === 'string') return fieldValue.toLowerCase().includes(searchTerm);
      if (typeof fieldValue === 'number' || typeof fieldValue === 'boolean') return fieldValue.toString().includes(searchTerm);
      return false;
    });

    this.productsSubject.next(filtered);
  } /* end filterBy */

  filterByCategory(event: Event): void { /* <-- ajuste pc#00003 */
    const select = event.target as HTMLSelectElement;
    const selectedCategory = select.value;

    if (!selectedCategory) {
      this.products = [...this.productsOriginal];
      this.productsSubject.next(this.products);
      return;
    }

    const filtered = this.productsOriginal.filter(
      (p: Product) => p.category.name === selectedCategory
    ); /* <-- ajuste pc#00003: filterProducts eliminado, filtro local por category.name */

    this.products = filtered;
    this.productsSubject.next(this.products);
  } /* end filterByCategory */

  filterByAllFields(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();

    if (!searchTerm) {
      this.products = [...this.productsOriginal];
      this.productsSubject.next(this.products);
      return;
    }

    const filtered = this.productsOriginal.filter(product => {
      return Object.entries(product).some(([key, value]) => {
        if (['_id', 'imageURL', 'available'].includes(key)) return false;
        if (typeof value === 'string') return value.toLowerCase().includes(searchTerm);
        if (typeof value === 'number' || typeof value === 'boolean') return value.toString().includes(searchTerm);
        return false;
      });
    });

    this.products = filtered;
    this.productsSubject.next(this.products);
  } /* end filterByAllFields */

  deleteProduct(_id: string): void { /* <-- ajuste pc#00003 */
    this.productService.deleteProduct(_id).subscribe({
      next: () => {
        Swal.fire('Eliminado', 'Producto eliminado correctamente', 'success');
      }
    });
  } /* end deleteProduct */

  openAddProductModal(): void { /* <-- ajuste pc#00003 */
    this.newProduct = this.createEmptyProduct();

    const modalElement = document.getElementById('addProductModal');
    if (!modalElement) return;

    const modalInstance = (window as any).bootstrap?.Modal?.getOrCreateInstance(modalElement);
    if (modalInstance) modalInstance.show();
  } /* end openAddProductModal */

  onProductRegistered(newProduct: Product): void { /* <-- ajuste pc#00003 */
    this.productService.createProduct(newProduct).subscribe({
      next: () => {
        Swal.fire('Registrado', 'Producto creado correctamente', 'success');
      }
    });
  } /* end onProductRegistered */

  onBrandChange(product: Product, event: Event): void { /* <-- ajuste pc#00003 */
    const select = event.target as HTMLSelectElement;
    const selectedId = select.value;
    const selectedBrand = this.brands.find(b => b._id === selectedId);
    if (selectedBrand) {
      product.brand = selectedBrand;
    }
  } /* end onBrandChange */

} /* end InventoryComponent */