/* payments.component.ts */
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable, take } from 'rxjs';
import { Payment } from '../../../core/models/payment-method.model';
import { PaymentMethodsService } from '../../../core/services/payment-methods.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [ CommonModule, RouterLink ],
  templateUrl: './payments.component.html',
  styleUrl: './payments.component.css'
})
export class PaymentsComponent implements OnInit {

  /* ob: metodos de pago del usuario actual */
  payments$!: Observable<Payment[]>;

  constructor(
    private paymentMethodsService: PaymentMethodsService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      this.payments$ = new Observable<Payment[]>();
      return;
    }

    this.payments$ = this.paymentMethodsService
      .getPaymentMethodsByUserId(currentUser._id);
  } /* end ngOnInit */
  
  onAddToPayment( payment: Payment ): void {
    
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no iniciada',
        text: 'Debes iniciar sesión para  agregar un metodo de pago.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: 'Dirección agregada',
      text: 'La dirección fue guardada correctamente.',
      confirmButtonText: 'Perfecto'      
    });
  } /* end onAddToPayment */

  onUpdatePayment(index: number): void {

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) return;

    this.payments$
      .pipe( take(1) )
      .subscribe((payments) => {

      const paymentToEdit = payments[index];

      if (!paymentToEdit) return;

      this.router.navigate(['/addPayment'], {
        state: {
          paymentToEdit,
          editIndex: index
        }
      });
    });

  } /* end onUpdatePayment */

  onDeletePayment(index: number): void {

    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) return;

    Swal.fire({
      title: '¿Eliminar el método de pago?',
      text: 'Está accion es permanente y no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Si, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {

      if (result.isConfirmed) {

        this.payments$
          .pipe( take(1) )
          .subscribe((payments) => {

          const paymentToDelete = payments[index];

          if (!paymentToDelete?._id) return;

          this.paymentMethodsService
            .deletePaymentMethod(paymentToDelete._id)
            .subscribe(() => {

              this.payments$ = this.paymentMethodsService
                .getPaymentMethodsByUserId(currentUser._id);

              Swal.fire({
                icon: 'success',
                title: 'Eliminado de métodos de pago',
                text: 'El método de pago fue removido correctamente',
                showConfirmButton: true
              });

            });

        });

      }

    });

  } /* end onDeletePayment */

} /* end class */