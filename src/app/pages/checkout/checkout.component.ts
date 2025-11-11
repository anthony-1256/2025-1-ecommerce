/***** src/app/pages/checkout/checkout.component.ts *****/
import { PurchaseService } from '../../core/services/purchase.service';
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../core/services/address.service';
import { Address } from '../../core/models/address.model';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { Router } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { Observable, Subscription } from 'rxjs';
import { Cart, CartItem } from '../../core/models/cart.model';
import { Product } from '../../core/models/product.model';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormAddaddressComponent } from "../forms/form-addaddress/form-addaddress.component";
import { PaymentMethod } from '../../core/types/enums';
import { Payment, UserPaymentEntry } from '../../core/models/payment.model';
import { PaymentService } from '../../core/services/payment.service';
import { FormAddpaymentComponent } from "../forms/form-addpayment/form-addpayment.component";
import { SalesService } from '../../core/services/sales.service';
import { BrandService } from '../../core/services/brand.service';
import { PricesService } from '../../core/services/prices.service';
import { CartComponent } from '../cart/cart.component';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormAddaddressComponent, FormAddpaymentComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  @ViewChild(CartComponent) cartComponent!: CartComponent;

  /* ob: observable decarrito */
  cart$!: Observable<Cart>;

  /* ar: direcciones disponibles del usuario actual */
  addresses: Address[] = [];

  /* ar: método de pago guardados por el usuario */
  userPaymentMethods: Payment[] = [];

  /* ob: direccion seleccionada por el usuario */
  selectedAddress: Address | null = null;

  /* cn: indice de la direccion actualmente seleccionada */
  selectedAddressIndex: number | null = null;

  /* ar: items actuales en el carrito */
  items: CartItem[] = [];

  /* cn: totales */
  totalQuantity: number = 0;  
  totalPrice: number = 0;

  /* ob: suscripcion para productos */
  productsSubscription: Subscription | null = null;

  /* formularios */
  showAddressForm: boolean = false;
  
  /* ar: metodos de pago y metodo seleccionado */
  paymentMethods: string[] = Object.values(PaymentMethod);
  selectedPaymentMethod: Payment | null = null;
  showPaymentForm: boolean = false;

  /* ob: usuario actual */
  currentUser: any;  

  constructor(
    private fb: FormBuilder, 
    private cartService: CartService,
    private router: Router,
    private productService: ProductService,
    private addressService: AddressService,
    private paymentService: PaymentService,
    private authService: AuthService,
    private purchaseService: PurchaseService,
    private salesService: SalesService,
    private brandService: BrandService,
    private pricesService: PricesService,
    private cdr: ChangeDetectorRef
  ){
    this.formAddress = new FormBuilder().group({
      street: ['', [Validators.required, Validators.minLength(3)]],
      number: ['', [Validators.required, Validators.minLength(3)]],
      neighbordhood: ['', [Validators.required, Validators.minLength(3)]],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
      city: ['', [Validators.required, Validators.minLength(3)]],
      state: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      cellPhone: ['', [Validators.required, Validators.minLength(10)]],      
    });

    /*  Inicializar usuario actual aquí */
    this.currentUser = this.authService.getCurrentUser(); /* 🔹 nueva línea */
  }

  /* ob: formulario reactivo para agregar direccion */
  formAddress: FormGroup;

  /* ob: control touched de campos */
  streetTouched: boolean = false;
  numberTouched: boolean = false;
  neighborhoodTouched: boolean = false;
  postalCodeTouched: boolean = false;
  cityTouched: boolean = false;
  stateTouched: boolean = false;
  phoneTouched: boolean = false;
  cellPhoneTouched: boolean = false;
  
ngOnInit() {
  // 1️⃣ Inicializar items desde el carrito actual
  this.items = this.cartService.getItems();

  // 2️⃣ Suscribirse al BehaviorSubject del carrito
  this.cart$ = this.cartService.cart$;  

  this.cart$.subscribe(cart => {    
    if (cart && Array.isArray(cart.items)) {

      this.items = cart.items;
      // Recalcular cantidad total
      this.totalQuantity = cart.totalQuantity;

      // ✅ Obtener el precio total real desde CartService
      this.totalPrice = cart.totalPrice + 0;
      this.cdr.detectChanges();

      console.log('[CHECKOUT DEBUG] after subscribe', {
        totalQuantity: this.totalQuantity,
        totalPrice: this.totalPrice
      });
    } else {
      this.items = [];
      this.totalQuantity = 0;
      this.totalPrice = 0;
    }
  });

  // 3️⃣ Cargar direcciones del usuario
  this.addressService.getAddressesByCurrentUser().subscribe(addresses => {
    this.addresses = addresses;
    if (addresses.length > 0) {
      this.selectedAddress = addresses[0];
      this.selectedAddressIndex = 0;
    }
  });

  // 4️⃣ Cargar métodos de pago del usuario
  this.paymentService.getPaymentsByCurrentUser().subscribe(payments => {
    this.userPaymentMethods = payments;
    const currentUserId = this.authService.getCurrentUser()?.idUser;
    if (currentUserId) {
      this.selectedPaymentMethod =
        this.paymentService.getDefaultPaymentByUser(currentUserId) || payments[0] || null;
    }
  });

  // 5️⃣ Escuchar cambios en localStorage para sincronización multi-pestaña
  window.addEventListener('storage', event => {
    if (event.key === this.cartService.getStorageKey()) {
      const newCart = JSON.parse(event.newValue || 'null');
      if (newCart?.items && Array.isArray(newCart.items)) {
        // Actualizar carrito interno
        this.cartService.setItems(newCart.items);

        // Actualizar items y cantidad
        this.items = this.cartService.getItems();
        this.totalQuantity = this.items.reduce((sum, item) => sum + (item.quantity ?? 1), 0);

        // ✅ Actualizar precio total usando CartService
        this.totalPrice;
      }
    }
  });
} /* fin ngOnInit */


  syncQuantitiesWithInventory(productsFromInventory: Product[]):void {
    let cartUpdated = false;

    this.items.forEach((item, index) => {
      const matchingProduct = productsFromInventory.find(p => p.idProduct === item.product.idProduct);

      if (!matchingProduct) {
        this.cartService.removeFromCart(item.product);
        cartUpdated = true;
        Swal.fire({
          icon: 'warning',
          title: 'Producto eliminado',
          text: `${item.product.productName} fue eliminado del inventario. Se retiro del carrito.`
        });
        return;
      }

      // Stock actual menor a la cantidad en carrito
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

    // Stock mayor que la cantidad en carrito (opcional informar)
    if (matchingProduct.quantity > item.quantity) {
      Swal.fire({
        icon: 'info',
        title: 'Stock aumentado',
        text: `El stock de ${item.product.productName} ha aumentado en el inventario. Puedes agregar más unidades si deseas.`
      });
    }
  });

  // Si hubo cambios, recargar items y totales
  if (cartUpdated) {
    this.items = [...this.cartService.getItems()];
    this.updateTotals();
  }
}

  updateTotals(): void {
    this.totalQuantity = this.cartService.getTotalQuantity();
    this.totalPrice = this.cartService.getTotalPrice();
  }

  /* mt: agregar nueva dirección para el usuario actual */
  onAddNewAddress(): void {
    const currentUserId = this.authService.getCurrentUser()?.idUser;

    if (!currentUserId) {
      Swal.fire({
        icon: 'error',
        title: 'Sesión no válida',
        text: 'No se pudo obtener el usuario actual.'
      });
      return;
    }

    /* cn: validación del formulario */
    if (this.formAddress.invalid) {
      this.formAddress.markAllAsTouched();
      Swal.fire({
        icon: 'warning',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos.',
      });
      return;
    }

    /* ob: construir dirección desde formulario */
    const newAddress: Address = {
      street: this.formAddress.value.street,
      number: this.formAddress.value.number,
      neighborhood: this.formAddress.value.neighborhood,
      postalCode: this.formAddress.value.postalCode,
      city: this.formAddress.value.city,
      state: this.formAddress.value.state,
      phone: this.formAddress.value.phone,
      cellPhone: this.formAddress.value.cellPhone,
      isDefault: this.addresses.length === 0
    };

    /* mt: registrar dirección usando el servicio */
    this.addressService.addAddressForUser(currentUserId, newAddress);

    /* mt: recargar lista de direcciones */
    this.addressService.getAddressesByCurrentUser().subscribe({
      next: (addresses: Address[]) => {
        this.addresses = addresses;
      }
    });
    this.formAddress.reset();
    this.resetTouchedFlags();

    /* mt: notificación de éxito */
    Swal.fire({
      icon: 'success',
      title: 'Dirección registrada',
      text: 'Tu nueva dirección fue guardada exitosamente.',
    });
  }

  
  /* mt: resetear flags touched */
  resetTouchedFlags(): void {
    this.streetTouched = false;
    this.numberTouched = false;
    this.neighborhoodTouched = false;
    this.postalCodeTouched =false;
    this.cityTouched = false;
    this.stateTouched = false;
    this.phoneTouched = false;
    this.cellPhoneTouched = false; 
  }

  /* fn: comparar objetos Address en [(ngModel)] */
  compareAddresses(a: Address, b: Address): boolean {
    return a && b ? a.street === b.street && a.number == b.number && a.city === b.city: a === b;
  }

  /* fn: comparar objetos Payment en [(ngModel)] */
  comparePayments(a: Payment, b: Payment): boolean {
    return a && b ? a.method === b.method && a.alias === b.alias && a.bank === b.bank : a === b;
  } /* fin comparePayments */

  /* onCompletePurchase */
  onCompletePurchase(): void {    

    
    console.log('selectedAddress:', this.selectedAddress);
    console.log('selectedPaymentMethod:', this.selectedPaymentMethod);
    console.log('cart items:', this.cartService.getItems());

    if (!this.selectedAddress) {
      Swal.fire({
        icon: 'warning',
        title: 'Direccón requerida',
        text: 'Debes seleccionar una dirección de entrega antes de continuar.'
      });
      return;
    }

    if (!this.selectedPaymentMethod) {
      Swal.fire({
        icon: 'warning',
        title: 'Método de pago requerido',
        text: 'Selecciona un método de pago antes de completar la compra.'
      });
      return;
    }

    const receipt = this.purchaseService.generateReceiptFromCart(
      this.selectedAddress,
      this.selectedPaymentMethod
    );

    console.log('generated receipt:', receipt);

    if (!receipt) {
      Swal.fire({
        icon: 'error',
        title: 'Error al generar recibo',
        text: 'No se pudo completar la compra. Intenta nuevamente.'
      });
      return;
    }

    /* 🔹 Nuevo: obtener userId como string para registerSale */
    const userId = this.currentUser.idUser.toString(); /* 🔹 convertir a string */

    /* 🔹 Registrar cada item del recibo como venta */
    receipt.items.forEach(item => {
      
      const product = item.product; /* 🔹 producto del carrito */
      this.salesService.registerSale(
        userId,                  /* 🔹 id del usuario como string */
        product.productName,      /* nombre del producto (opcional) */
        product.idProduct,       /* id del producto */
        item.quantity,           /* cantidad vendida */
        item.unitPrice,          /* precio unitario */
        product.brand?.name || '',           /* marca (opcional) */
      );
    });
    
    localStorage.setItem('sales', JSON.stringify(this.salesService['salesSubject'].value));
    window.dispatchEvent(new StorageEvent('storage', { key: 'sales' }));    
    
    Swal.fire({
      icon: 'success',
      title: 'Compra completada',
      text: `Tu compra fue registrada exitosamente. Puedes consultar el comporbante más tarde. Total: ${receipt.totalAmount}`,
      confirmButtonText: 'Aceptar'

    }).then(() => {
      this.router.navigate(['/historial de compras']);
    });

  } // Fin de onCompletePurchase

  onBackToCart(): void {
    this.router.navigate(['/carrito']); // Asumiendo que tu ruta de carrito es /cart
  }

  onCancelPurchase(): void {
    Swal.fire({
      icon: 'question',
      title: 'Cancelar compra',
      text: '¿Estás seguro de que deseas cancelar la compra y vaciar el carrito?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then(result => {
      if(result.isConfirmed) {
        this.cartService.clearCart(); // Vacía el carrito
        this.router.navigate(['/productos']); // Redirige al carrito
        Swal.fire({
          icon: 'success',
          title: 'Compra cancelada',
          text: 'Tu carrito ha sido vaciado.'
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  }

}