/* form-addpayment.component.ts */
import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod, BankOption } from '../../../core/types/enums';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import { Payment } from '../../../core/models/payment-method.model';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-form-addpayment',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule],
  templateUrl: './form-addpayment.component.html',
  styleUrl: './form-addpayment.component.css'
})
export class FormAddpaymentComponent implements OnInit {

  paymentToEdit?: Payment;
  editIndex?: number;

  /* ob: formulario reactivo */
  paymentForm: FormGroup;

  /* ar: opciones disponibles de métodos de pago y banco */
  paymentMethods= Object.values(PaymentMethod);
  bankOptions = Object.values(BankOption);

  /* objetos de control de estado tocado de los imputs */
  methodTouched: boolean = false;
  bankTouched: boolean = false;
  aliasTouched: boolean = false;

  /* ob: servicios inyectados */
  private paymentMethodsService = inject(PaymentMethodsService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  constructor() {

    /* mt: inicializar formulario con validaciones básicas */
    this.paymentForm = this.fb.group({
      method: ['', Validators.required],
      bank: [''],
      alias: ['', Validators.required]
    });

  }

  ngOnInit(): void {
    const { paymentToEdit, editIndex } = history.state;

    if (paymentToEdit && typeof editIndex === 'number') {
      this.paymentToEdit = paymentToEdit;
      this.editIndex = editIndex;

      this.paymentForm.patchValue({

        method: paymentToEdit.type,
        bank: paymentToEdit.bankName ?? '',
        alias: paymentToEdit.cardHolderName ?? '',
      });
    }

    /* Actualizar validación del campo 'bank' dinámicamente */
    this.paymentForm.get('method')?.valueChanges.subscribe(method => {
      const bankControl = this.paymentForm.get('bank');

      if (
        method === PaymentMethod.CreditCard ||
        method === PaymentMethod.DebitCard ||
        method === PaymentMethod.BankTransfer
      ) {
        bankControl?.setValidators(Validators.required);
      } else {
        bankControl?.clearValidators();
        bankControl?.setValue('');
      }

      bankControl?.updateValueAndValidity();
    });
  } /* end ngOnInit */  
  
  async onSubmit(): Promise<void> {

    /* cn: validar que el formulario esté valido */
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      Swal.fire({
        icon: 'error',
        title: 'Formulario incompleto',
        text: 'Por favor completa todos los campos requeridos correctamente.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }
        
    /* ob: obtener usuario actual */
    const currentUser = JSON.parse(
      localStorage.getItem('user') ?? 'null'
    );

    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no identificado',
        text: 'No se pudo recuperar la sesion actual.'
      });
      return;
    }

    const newPayment: Payment = {
      _id: this.paymentToEdit?._id ?? '',
      user: currentUser._id,

      type: this.paymentForm.value.method,

      bankName: this.paymentForm.value.bank || undefined,

      cardHolderName: this.paymentForm.value.alias || undefined,

      isDefault: false,
      isActive: true,
    };

    if (this.paymentToEdit && this.editIndex !== undefined) {
      
      /* mt: modo edición */
      await firstValueFrom(
        this.paymentMethodsService.updatePaymentMethod(newPayment)
      );
      Swal.fire({
        icon: 'success',
        title: 'Método registrado',
        text: 'El método de pago fue guardado exitosamente.'
      });
    } else {

      /* mt: modo agregar */
      await firstValueFrom(
        this.paymentMethodsService.createPaymentMethod(newPayment)
      );
      Swal.fire({
        icon: 'success',
        title: 'Método de pago registrado',
        text: 'Tu nuevo método fue guardado exitosamente.'
      });
    }

    /* mt: reset formulario y flags */
    this.paymentForm.reset();
    this.resetTouchedFlags();
  } /* end onSubmit */

  confirmCancel(): void {
    if (!this.paymentForm.dirty) return;

    Swal.fire({
      title: '¿Quieres cancelar el registro?',
      text: 'Si cancelas, los datos del formulario se perderán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No, volver'
    }).then(result => {

      if (result.isConfirmed) {
        this.resetForm();

        Swal.fire({
          icon: 'info',
          title: 'Registro cancelado',
          text: 'El formulario  ha sido limpiado.'
        });
      }
    });
  } /* end confirmCancel */

  resetForm(): void {
    this.paymentForm.reset();
    this.methodTouched = false;
    this.bankTouched = false;
    this.aliasTouched = false;
  } /* end resetForm */

  resetTouchedFlags(): void {
    this.methodTouched = false;
    this.bankTouched = false;
    this.aliasTouched = false;
  } /* end resetTouchedFlags */
  
  isFormReady(): boolean {
    return this.paymentForm.valid && Object.keys(this.paymentForm.controls).every(key => {
      const control = this.paymentForm.get(key);
      return control?.touched;
    });
  } /* end isFormReady */
  
  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  } /* end showAlert */
  
  goToPayments(): void {
    this.router.navigate(['/pagos']);
  } /* end goToPayments */

  get requiresBank(): boolean {
    const method = this.paymentForm.get('method')?.value;
    return method === PaymentMethod.CreditCard ||
            method === PaymentMethod.DebitCard ||
            method === PaymentMethod.BankTransfer;
  } /* end requiresBank */

} /* end FormAddPaymentComponent */