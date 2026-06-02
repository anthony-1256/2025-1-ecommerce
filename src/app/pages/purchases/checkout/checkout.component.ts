/* checkout.component.ts */
import { ChangeDetectorRef, Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AddressService } from '../../../core/services/address.service';
import { Address } from '../../../core/models/address.model';
import { AuthService, AuthenticatedUser } from '../../../core/services/auth.service'; /* <-- ajuste pc#00003 */
import { CartService } from '../../../core/services/cart.service';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Cart, CartItem } from '../../../core/models/cart.model';
import { Product } from '../../../core/models/product.model';
import Swal from 'sweetalert2';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormAddaddressComponent } from "../../../pages/addresses/form-addaddress/form-addaddress.component";
import { PaymentMethod } from '../../../core/types/enums';
import { Payment } from '../../../core/models/payment-method.model';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { FormAddpaymentComponent } from "../../../pages/payments/form-addpayment/form-addpayment.component";
import { SalesService } from '../../../core/services/sales.service';
import { CartComponent } from '../../../pages/purchases/cart/cart.component';
import { PurchaseService } from '../../../core/services/purchase.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormAddaddressComponent,
    FormAddpaymentComponent
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  @ViewChild(CartComponent) cartComponent!: CartComponent;

  cart$!: Observable<Cart | null>;
  addresses: Address[] = [];
  userPaymentMethods: Payment[] = [];
  selectedAddress: Address | null = null;
  selectedAddressIndex: number | null = null;
  items: CartItem[] = [];
  totalQuantity: number = 0;
  totalPrice: number = 0;
  productsSubscription: Subscription | null = null;
  showAddressForm: boolean = false;
  paymentMethods: string[] = Object.values(PaymentMethod);
  selectedPaymentMethod: Payment | null = null;
  showPaymentForm: boolean = false;

  currentUser: AuthenticatedUser | null = null; /* <-- ajuste pc#00003 */

  formAddress: FormGroup;

  streetTouched: boolean = false;
  numberTouched: boolean = false;
  neighborhoodTouched: boolean = false;
  postalCodeTouched: boolean = false;
  cityTouched: boolean = false;
  stateTouched: boolean = false;
  phoneTouched: boolean = false;
  cellPhoneTouched: boolean = false; 

  constructor(
    private cartService: CartService,
    private router: Router,
    private addressService: AddressService,
    private paymentMethodService: PaymentMethodsService,
    private authService: AuthService,
    private purchaseService: PurchaseService,
    private salesService: SalesService,
    private cdr: ChangeDetectorRef
  ) {
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

    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.cart$ = this.cartService.cart$;

    this.cart$.subscribe(cart => {
      if (cart && Array.isArray(cart.items)) {
        this.items = cart.items;
        this.totalQuantity = cart.totalQuantity;
        this.totalPrice = cart.totalPrice;
        this.cdr.detectChanges();
      } else {
        this.items = [];
        this.totalQuantity = 0;
        this.totalPrice = 0;
      }
    });

    this.addressService.getAddressesByUser().subscribe(addresses => {
      this.addresses = addresses;
      if (addresses.length > 0) {
        this.selectedAddress = addresses[0];
        this.selectedAddressIndex = 0;
      }
    });

    if (this.currentUser?._id) { /* <-- ajuste pc#00003: guard por currentUser null */
      this.paymentMethodService.getPaymentMethodsByUserId(this.currentUser._id).subscribe(payments => {
        this.userPaymentMethods = payments;
        this.selectedPaymentMethod = payments[0] || null;
      });
    }
  } /* fin ngOnInit */

  syncQuantitiesWithInventory(productsFromInventory: Product[]): void {
    let cartUpdated = false;

    this.items.forEach((item) => {
      const matchingProduct = productsFromInventory.find(p => p._id === item.product._id);

      if (!matchingProduct) {
        if (item.product._id) {
          this.cartService.removeFromCart(item.product._id).subscribe();
        }
        cartUpdated = true;
        Swal.fire({ icon: 'warning', title: 'Producto eliminado', text: `${item.product.name} fue eliminado del inventario.` });
        return;
      }

      if (matchingProduct.quantity < item.quantity) {
        item.quantity = matchingProduct.quantity;
        cartUpdated = true;
        Swal.fire({ icon: 'info', title: 'Stock actualizado', text: `La cantidad de ${item.product.name} fue ajustada a ${matchingProduct.quantity}.` });
        return;
      }

      if (matchingProduct.quantity > item.quantity) {
        Swal.fire({ icon: 'info', title: 'Stock aumentado', text: `El stock de ${item.product.name} ha aumentado.` });
      }
    });

    if (cartUpdated) {
      this.items = this.cartService.getCartSnapshot()?.items || [];
      this.updateTotals();
    }
  } /* end syncQuantitiesWithInventory */

  updateTotals(): void {
    const cart = this.cartService.getCartSnapshot();
    this.totalQuantity = cart?.totalQuantity || 0;
    this.totalPrice = cart?.totalPrice || 0;
  } /* end updateTotals */

  onAddNewAddress(): void {
    const currentUserId = this.authService.getCurrentUser()?._id;

    if (!currentUserId) {
      Swal.fire({ icon: 'error', title: 'Sesión no válida', text: 'No se pudo obtener el usuario actual.' });
      return;
    }

    if (this.formAddress.invalid) {
      this.formAddress.markAllAsTouched();
      Swal.fire({ icon: 'warning', title: 'Formulario incompleto', text: 'Por favor completa todos los campos requeridos.' });
      return;
    }

    const newAddress: Omit<Address, '_id'> = { /* <-- ajuste pc#00003 */
      user: currentUserId,
      street: this.formAddress.value.street,
      number: this.formAddress.value.number,
      neighborhood: this.formAddress.value.neighborhood,
      municipality: this.formAddress.value.city,
      postalCode: this.formAddress.value.postalCode,
      city: this.formAddress.value.city,
      state: this.formAddress.value.state,
      phone: this.formAddress.value.phone,
      cellPhone: this.formAddress.value.cellPhone,
      isDefault: this.addresses.length === 0,
      isActive: true
    };

    this.addressService.createAddress(newAddress as Address).subscribe();

    this.addressService.getAddressesByUser().subscribe({
      next: (addresses: Address[]) => { this.addresses = addresses; }
    });

    this.formAddress.reset();
    this.resetTouchedFlags();

    Swal.fire({ icon: 'success', title: 'Dirección registrada', text: 'Tu nueva dirección fue guardada exitosamente.' });
  } /* end onAddNewAddress */
  
  resetTouchedFlags(): void {
    this.streetTouched = false;
    this.numberTouched = false;
    this.neighborhoodTouched = false;
    this.postalCodeTouched = false;
    this.cityTouched = false;
    this.stateTouched = false;
    this.phoneTouched = false;
    this.cellPhoneTouched = false;
  } /* end resetTouchedFlags */

  compareAddresses(a: Address, b: Address): boolean {
    return a && b ? a.street === b.street && a.number == b.number && a.city === b.city : a === b;
  } /* end compareAddresses */

  comparePayments(a: Payment, b: Payment): boolean {
    return a && b ? a._id === b._id : a === b;
  } /* end comparePayments */

  async onCompletePurchase(): Promise<void> { /* <-- ajuste pc#00003: async */

    if (!this.selectedAddress) {
      Swal.fire({ icon: 'warning', title: 'Dirección requerida', text: 'Debes seleccionar una dirección de entrega.' });
      return;
    }

    if (!this.selectedPaymentMethod) {
      Swal.fire({ icon: 'warning', title: 'Método de pago requerido', text: 'Selecciona un método de pago.' });
      return;
    }

    const receipt = await this.purchaseService.generateReceiptFromCart( /* <-- ajuste pc#00003: await */
      this.selectedAddress,
      this.selectedPaymentMethod
    );

    if (!receipt) {
      Swal.fire({ icon: 'error', title: 'Error al generar recibo', text: 'No se pudo completar la compra. Intenta nuevamente.' });
      return;
    }

    const userId = this.currentUser?._id ?? ''; /* <-- ajuste pc#00003: guard null */

    receipt.items.forEach(item => {
      const product = item.product;
      if (!product._id) return;

      this.salesService.registerSale({
        userId,
        _id: product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }).subscribe({
        error: () => {
          Swal.fire({ icon: 'error', title: 'Error al registrar venta', text: `No se pudo registrar la venta de ${product.name}.` });
        }
      });
    });

    Swal.fire({
      icon: 'success',
      title: 'Compra completada',
      text: `Tu compra fue registrada exitosamente. Total: ${receipt.totalAmount}`,
      confirmButtonText: 'Aceptar'
    }).then(() => {
      this.router.navigate(['/historial de compras']);
    });
  } /* end onCompletePurchase */

  onBackToCart(): void {
    this.router.navigate(['/carrito']);
  } /* end onBackToCart */

  onCancelPurchase(): void {
    Swal.fire({
      icon: 'question',
      title: 'Cancelar compra',
      text: '¿Estás seguro de que deseas cancelar la compra?',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.cartService.clearCart().subscribe(); /* <-- ajuste pc#00003 */
        this.router.navigate(['/productos']);
        Swal.fire({ icon: 'success', title: 'Compra cancelada', text: 'Tu carrito ha sido vaciado.' });
      }
    });
  } /* end onCancelPurchase */

  ngOnDestroy(): void {
    this.productsSubscription?.unsubscribe();
  } /* end ngOnDestroy */

} /* fin CheckoutComponent */