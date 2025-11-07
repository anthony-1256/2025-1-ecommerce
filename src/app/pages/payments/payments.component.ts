import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { Payment } from '../../core/models/payment.model';
import { PaymentService } from '../../core/services/payment.service';
import Swal from 'sweetalert2';

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
    private paymentService: PaymentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.payments$ = this.paymentService.getPaymentsByCurrentUser();
  }

  /* mt: agregar método */
  onAddToPayment( payment: Payment ): void {

    /* ob: obtener usuario actual */
    const currentUser = this.paymentService['authService'].getCurrentUser();
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Sesión no iniciada',
        text: 'Debes iniciar sesión para  agregar un metodo de pago.',
        confirmButtonText: 'Aceptar'
      });
      return;
    }

    /* mt: guardar dirección */
    this.paymentService.addPaymentsForUser(currentUser.idUser, payment);

    Swal.fire({
      icon: 'success',
      title: 'Dirección agregada',
      text: 'La dirección fue guardada correctamente.',
      confirmButtonText: 'Perfecto'      
    });
  }

  /* mt: actualizar método de pago */
  onUpdatePayment(index: number): void {
    const currentUser = this.paymentService['authService'].getCurrentUser();
    if (!currentUser) return;

    const userPayments = this.paymentService.getPaymentsByUser
    (currentUser.idUser);
    const paymentToEdit = userPayments[index];

    if (!paymentToEdit) return;

    history.pushState(null, '', '');
    window.location.href = '/addPAyments?edit=true';

    window.history.replaceState(null, '', '');

    this.router.navigate(['/addPayment'], {
      state: {
        paymentToEdit,
        editIndex: index
      }
    });
  }

  /* mt: eliminar método de pago */
  onDeletePayment(index: number): void {
    const currentUser = this.paymentService['authService'].getCurrentUser();
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
        this.paymentService.deletePaymentForUser(currentUser.idUser, index);    
        Swal.fire({
          icon: 'success',
          title: 'Eliminado de métodos de pago',
          text: 'El método de pago fue removido correctamente',
          showConfirmButton: true
        });
      }
    });
  }

}