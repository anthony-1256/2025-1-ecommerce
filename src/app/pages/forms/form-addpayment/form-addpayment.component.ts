import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PaymentMethod, BankOption } from '../../../core/types/enums';
import { PaymentService } from '../../../core/services/payment.service';
import { AuthService } from '../../../core/services/auth.service';
import { Payment } from '../../../core/models/payment.model';
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
  private paymenService: PaymentService = inject(PaymentService);
  private authService: AuthService= inject(AuthService);
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

        method: paymentToEdit.method,
        bank: paymentToEdit.bank,
        alias: paymentToEdit.alias,
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
  }  
  
  /* mt: guardar nuevo metodo de pago */
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
    const currentUser = this.paymenService['authService'].getCurrentUser();    
    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'Usuario no identificado',
        text: 'No se pudo recuperar la sesion actual.'
      });
      return;
    }

    /* ob: obtener pagos actuales del usuario desde el observable */
    const currentPayments: Payment[] = await firstValueFrom(
      this.paymenService.getPaymentsByCurrentUser()
    );

    /* ob: construir el nuevo Payment incluyendo isDefault */
    const newPayment: Payment = {
      method: this.paymentForm.value.method,
      bank: this.paymentForm.value.bank,
      alias: this.paymentForm.value.alias,
      isDefault: currentPayments.length === 0 // Primer método agregado será el default
    };

    if (this.paymentToEdit && this.editIndex !== undefined) {
      /* mt: modo edición */
      this.paymenService.updatePaymentForUser(currentUser.idUser, this.editIndex, newPayment);
      Swal.fire({
        icon: 'success',
        title: 'Método registrado',
        text: 'El método de pago fue guardado exitosamente.'
      });
    } else {
      /* mt: modo agregar */
      this.paymenService.addPaymentsForUser(currentUser.idUser, newPayment);
      Swal.fire({
        icon: 'success',
        title: 'Método de pago registrado',
        text: 'Tu nuevo método fue guardado exitosamente.'
      });
    }

    /* mt: reset formulario y flags */
    this.paymentForm.reset();
    this.resetTouchedFlags();
  }


  /* mt: confirmar cancelación del formulario */
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
  }

  resetForm(): void {
    this.paymentForm.reset();
    this.methodTouched = false;
    this.bankTouched = false;
    this.aliasTouched = false;
  }

  resetTouchedFlags(): void {
    this.methodTouched = false;
    this.bankTouched = false;
    this.aliasTouched = false;
  }

  /* mt: veririficar si el formulario está lsito para enviar */
  isFormReady(): boolean {
    return this.paymentForm.valid && Object.keys(this.paymentForm.controls).every(key => {
      const control = this.paymentForm.get(key);
      return control?.touched;
    });
  }

  /* mt: mostrar alertas con Sweetalert */
  showAlert(type: 'success' | 'error', message: string): void {
    Swal.fire({
      icon: type,
      title: 'Aviso',
      text: message,
      showConfirmButton: true
    });
  }

  /* mt: regresar a métodos de pago de usuario */
  goToPayments(): void {
    this.router.navigate(['/pagos']);
  }

  get requiresBank(): boolean {
    const method = this.paymentForm.get('method')?.value;
    return method === PaymentMethod.CreditCard ||
            method === PaymentMethod.DebitCard ||
            method === PaymentMethod.BankTransfer;
  }

}