/***** src/app/pages/forms/form-addproduct/form-addproduct.component.ts *****/

import { Component, EventEmitter, Output } from '@angular/core';
import { Product } from '../../../core/models/product.model';
import { Capacity, ProductCategory, Speed } from '../../../core/types/enums';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { Brand } from '../../../core/models/brand.model';   // ✅ modelo actualizado
import { BrandService } from '../../../core/services/brand.service'; // ✅ servicio

@Component({
  selector: 'app-form-addproduct',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './form-addproduct.component.html',
  styleUrl: './form-addproduct.component.css'
})
export class FormAddproductComponent {

  /* ob: emisor del producto cuando se registra */
  @Output() productRegistered = new EventEmitter<Product>();

  /* ar: errores de validación */
  errors: string[] = [];
  /* ar: lista de productos existentes */
  products: Product[] = [];

  /* ob: enumeración para categoria */
  public brands: Brand[] = [];
  category = ProductCategory;
  capacity = Capacity;
  speed = Speed;

  /* ob: formulario reactvo para registrar producto */
  form: FormGroup;

  /* ob: control de estado tocado de inputs producto */
  imgProductTouched: boolean = false;
  productNameTouched: boolean = false;
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

  /* ob: vista previa de imagen seleccionada */
  imagePreview: string | null = null;

  /* ob: mensaje dinámico de estado según la cantidad */
  quantityStatusMessage: string = 'Sin datos.';

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private brandService: BrandService,
    private router: Router
  ){
    /* ob: formulario reactivo para registrar producto */
    this.form = this.fb.group({
      imgProduct: ['', [Validators.required]],
      productName: ['', [Validators.required, Validators.minLength(3)]],

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

  /* mt: ngOnInit inicialización del componente */
  ngOnInit(): void {
    const storedProducts = this.productService.getAllProducts();
    this.products = storedProducts && Array.isArray(storedProducts) ? storedProducts : [];

    // Marcas desde localStorage
    this.brandService.brands$.subscribe((storedBrands: Brand[]) => {
      this.brands = storedBrands || [];
    });
  }

  
  /* ✅ getter dinámico para opciones de marcas */
  get brandOptions(): Brand[] {
    return this.brands;
  }
  
  /* mt: admin registra nuevo producto */
  adminRegisterProduct(): void {

    /* validar formulario antes de continuar */
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.errors.push('Completar todos los campos requeridos.');
      return;
    }

    /* ob: extraer datos del formulario */
    const adminFormData = this.form.value;

    /* ob: generar ID mediante servicio centralizado */
    const newId = this.productService.generateUniqueProductId();

    /* ob: crear nuevo producto desde panel de admin */
    const newProduct: Product = {
      idProduct: newId,
      imgProduct: this.imagePreview || '',
      productName: adminFormData.productName,
      brand: adminFormData.brand,
      model: adminFormData.model,
      description: adminFormData.description,
      category: adminFormData.category,
      capacity: adminFormData.capacity,
      speed: adminFormData.speed,
      sku: adminFormData.sku,
      price: adminFormData.price,
      quantity: adminFormData.quantity,
      available: adminFormData.available // ← aquí también corregido
    };

    /* cn: verificación de Sku duplicado */
    if (this.productService.isSkuDuplicate(adminFormData.sku)) {
      this.errors.push('El SKU ingresado ya existe. Usa uno diferente.');
      this.showAlert('error', 'El SKU ingresado ya está en uso.' );
      return;
    }

    console.log('[FormAddproduct] Datos de producto a registrar: ', newProduct);
    /* mt: registrar producto en el servicio */
    this.productService.register(newProduct);

    /* mt: emitir nuevo producto registrado hacia el componente padre */
    this.productRegistered.emit(newProduct);

    /* limpiar errores previos y formulario */
    this.errors = [];
    this.resetForm();

    /* mt: mostrar alerta de registro exitoso */
    Swal.fire({
      icon: 'success',
      title: '¡Producto registrado.!',
      text: 'Producto creado con exito',
      confirmButtonText: 'Aceptar'
    });
  } /* fin adminRegisterProduct */


  /* mt: reiniciar formulario */
  resetForm(): void {
    this.form.reset();

    /* Limpiar vista previa de imagen */
    this.imagePreview = null;

    this.imgProductTouched = false;
    this.productNameTouched = false;
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
  }

  /* mt: confirmar cancelación del formulario */
  confirmCancel(): void {

    /* cn: verificacion de cambios sin guardar */
    if (!this.form.dirty) return;

    /* mt: alerta de confirmación */
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Si cancelas, los datos del formulario se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {

      /* cn: limpiar formulario si es confirm */
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
  }

  /* mt: verificar si el formulario está listo para enviar */
  isFormReady(): boolean {
    return this.form.valid && Object.keys(this.form.controls).every(key => {
      const control = this.form.get(key);
      return control?.touched;
    });
  }

  /* fn: actualiza el estado de availability y mensaje asociado segun cantidad */
  updateAvailability(): void {
    const quantityControl = this.form.get('quantity');

    /* fn: si no se ha tocado todavia, no hacer nada */
    if (!quantityControl?.touched) {
      this.form.get('available')?.setValue(false);
      return;
    }

    const value = quantityControl.value;

    /* cn: sin valor (null, undefied, cadena vacia) o NaN */
    if (value === null || value ==='' || isNaN(value)) {
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Sin datos de disponibilidad';
      return;
    }

    const quantity = Number (value);

    /* cn: cantidad cero */
    if (value === 0){
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Producto sin existencias';
      return;
    }

    /* cn: cantidad valida y mayor a cero */
    if (quantity) {
      this.form.get('available')?.setValue(true);
      this.quantityStatusMessage = 'Producto disponible';      
    }
  }

  /********************/
  /* mt: mostrar alertas con sweetalert */
  showAlert( type: 'success' | 'error', message: string ): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  }

/* ********** Seguridad: lectura de imagen ********** */
onImageSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input?.files?.[0];

  if (!file) {
    console.warn('[FormAddproduct] No se seleccionó ningún archivo');
    return;
  }

  // Nueva instancia de FileReader para cada archivo
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const result = reader.result;
      if (!result) throw new Error('El resultado de la lectura es nulo o inválido');

      // ✅ Crear una copia inmutable del resultado
      const imageSrc = `${result}`;

      // Guardar copia en el objeto, no la referencia directa
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

  // ✅ Asegurar lectura en formato Base64
  reader.readAsDataURL(file);

  // Limpieza del input para evitar reutilización de referencia
  input.value = '';
}
/* ********** Fin de seguridad: lectura de imagen ********** */





  /* mt: obtener opciones de categorías desde enum ProductCategory */
  get categoryOptions(): string[] {
    return Object.values(this.category);
  }

  /* mt: obtener opciones de capacidades desde enum Capacity */
  get capacityOptions(): string[] {
    return Object.values(this.capacity);
  }

  /* mt: obtener opciones de velocidades desde enum Speed */
  get speedOptions(): string[] {
    return Object.values(this.speed);
  }

}