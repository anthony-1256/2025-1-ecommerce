/* form-addproduct.component.ts */
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { Capacity, ProductCategory, Speed } from '../../../core/types/enums';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Brand } from '../../../core/models/brand.model';
import { BrandService } from '../../../core/services/brand.service';

@Component({
  selector: 'app-form-addproduct',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './form-addproduct.component.html',
  styleUrl: './form-addproduct.component.css'
})
export class FormAddproductComponent implements OnInit {
  
  @Output() productRegistered = new EventEmitter<Product>();
  
  errors: string[] = [];
  
  products: Product[] = [];
  
  public brands: Brand[] = [];
  category = ProductCategory;
  capacity = Capacity;
  speed = Speed;

  form: FormGroup;

  imageTouched: boolean = false;
  nameTouched: boolean = false;
  brandTouched: boolean = false;
  modelTouched: boolean = false;
  descriptionTouched: boolean = false;
  categoryTouched: boolean = false;
  capacityTouched: boolean = false;
  speedTouched: boolean = false;
  skuTouched: boolean = false;
  priceTouched: boolean = false;
  quantityTouched: boolean = false;
  availableTouched: boolean =false;

  imagePreview: string | null = null;

  quantityStatusMessage: string = 'Sin datos.';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private brandService: BrandService
  ){
    
    this.form = this.fb.group({
      image: ['', [Validators.required]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      brand: ['', [Validators.required]],      
      model: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', [Validators.required]],
      capacity: ['', [Validators.required]],
      speed: ['', [Validators.required]],
      sku: ['', [Validators.required]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      quantity: ["", [Validators.required, Validators.min(0)]],
      available: [false, [Validators.required]] // ← aquí corregido
    });
  }
  
  ngOnInit(): void {

    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: () => {
        this.products = [];
      }
    });

    this.brandService.brands$.subscribe((storedBrands: Brand[]) => {
      this.brands = storedBrands || [];
    });

  } /* end ngOnInit */
  
  get brandOptions(): Brand[] {
    return this.brands;
  } /* end brandOptions */  
  
  adminRegisterProduct(): void {
  
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errors.push('Completar todos los campos requeridos.');
      return;
    }
    
    const adminFormData = this.form.value;

    const newProduct: Omit<Product, '_id'> = { /* <-- ajuste pc#00003 */
      imageURL: this.imagePreview || '',
      name: adminFormData.name,
      brand: adminFormData.brand,
      model: adminFormData.model,
      description: adminFormData.description,
      category: adminFormData.category,
      capacity: adminFormData.capacity,
      speed: adminFormData.speed,
      sku: adminFormData.sku,
      price: adminFormData.price,
      quantity: adminFormData.quantity,
      available: adminFormData.available
    };

    console.log('[FormAddproduct] Datos de producto a registrar: ', newProduct);

    this.productService.createProduct(newProduct).subscribe({

      next: (createdProduct) => {

        this.productRegistered.emit(createdProduct);

        this.errors = [];
        this.resetForm();

        Swal.fire({
          icon: 'success',
          title: '¡Producto registrado.!',
          text: 'Producto creado con exito',
          confirmButtonText: 'Aceptar'
        });

      },

      error: (error) => {

        this.errors.push(error.message);

        Swal.fire({
          icon: 'error',
          title: 'Error al registrar producto',
          text: error.message,
          confirmButtonText: 'Aceptar'
        });

      }

    });

  } /* fin adminRegisterProduct */

  resetForm(): void {
    this.form.reset();
    
    this.imagePreview = null;

    this.imageTouched = false;
    this.nameTouched = false;
    this.brandTouched = false;
    this.modelTouched = false;
    this.descriptionTouched = false;
    this.categoryTouched = false;
    this.capacityTouched = false;
    this.speedTouched = false;
    this.skuTouched = false;
    this.priceTouched = false;
    this.quantityTouched = false;
    this.availableTouched = false;
  } /* end resetForm */

  confirmCancel(): void {

    if (!this.form.dirty) return;

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cancelas, los datos del formulario se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {
      
      if (result.isConfirmed) {
        this.resetForm();

        /* mt: alerta de confirmación exitosa */
        Swal.fire({
          icon: 'info',
          title: 'Registro cancelado',
          text: 'El formulario ha sido limpiado.'
        });
      }
    });
  } /* end confirmCancel */

  isFormReady(): boolean {
    return this.form.valid && Object.keys(this.form.controls).every(key => {
      const control = this.form.get(key);
      return control?.touched;
    });
  } /* end isFormReady */

  updateAvailability(): void {
    const quantityControl = this.form.get('quantity');
    
    if (!quantityControl?.touched) {
      this.form.get('available')?.setValue(false);
      return;
    }

    const value = quantityControl.value;
    
    if (value === null || value ==='' || isNaN(value)) {
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Sin datos de disponibilidad';
      return;
    } /* end updateAvailability */

    const quantity = Number (value);
    
    if (value === 0){
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Producto sin existencias';
      return;
    }
    
    if (quantity) {
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Producto disponible';      
    }
  } /* end updateAvailability */
  
  showAlert( type: 'success' | 'error', message: string ): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  } /* end showAlert */

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];

    if (!file) {
      console.warn('[FormAddproduct] No se seleccionó ningún archivo');
      return;
    }
    
    const reader = new FileReader();

    reader.onload = () => {
      try {
        const result = reader.result;
        if (!result) throw new Error('El resultado de la lectura es nulo o inválido');

        const imageSrc = `${result}`;


        this.imagePreview = imageSrc;

      } catch (error) {
        console.error('[FormAddproduct] Error en onload al procesar imagen:', error);
        alert('No se pudo procesar la imagen seleccionada correctamente');
      }
    };

    reader.onerror = (error) => {
      console.error('[FormAddproduct] Error en FileReader:', error);
      alert('Ocurrió un problema al leer el archivo de imagen');
    };

    reader.readAsDataURL(file);


    input.value = '';
  } /* end onImageSelected */

  get categoryOptions(): string[] {
    return Object.values(this.category);
  } /* end categoyOptions */

  get capacityOptions(): string[] {
    return Object.values(this.capacity);
  } /* end capacityOptions */

  get speedOptions(): string[] {
    return Object.values(this.speed);
  } /* end speedOptions */

} /* end FormAddproductComponent */