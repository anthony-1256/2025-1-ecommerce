/***** src/app/core/services/payment.service.ts *****/
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Payment, UserPaymentEntry } from '../models/payment.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  /* ar: lista interna de metodos de pago agrupados por ususario */
  private userPayments: UserPaymentEntry[] = [];

  /* ob: observable reactivo para los metodos de pago de todos los usuarios  */
  private paymentsSubject = new BehaviorSubject<UserPaymentEntry[]>([]);
  public payments$: Observable<UserPaymentEntry[]> = this.paymentsSubject.asObservable();

  constructor(
    private authService: AuthService
  ) {
    this.loadPaymentsFromLocalStorage();
  }

  /* mt: cargar metodos de pago desde localStorage */
  private loadPaymentsFromLocalStorage(): void {
    const stored = localStorage.getItem('userPayments');
    this.userPayments = stored ? JSON.parse(stored): [];
    this.paymentsSubject.next(this.userPayments);
  }

  /* mt: cargar metodos de pago desde localStorage */
  private savePaymentsToLocalStorage(): void {
    localStorage.setItem('userPayments', JSON.stringify(this.userPayments));
    this.paymentsSubject.next(this.userPayments);
  }  

  /* fn: obtener todas los metodos de pago de un usuario */
  public getPaymentsByUser(idUser: number): Payment[] {
    const entry = this.userPayments.find(entry => entry.idUser === idUser);
    return entry ? entry.payments: [];
  }

  /* fn: obtener el método de pago por default de un usuario */
  public getDefaultPaymentByUser(idUser: number): Payment | null {
    const payments = this.getPaymentsByUser(idUser);

    if (!payments || payments.length === 0 ) return null;

    /* buscar metodo default */
    const defaultPayment = payments.find(p => p.isDefault);

    /* toma el primer metodo si no hay mas */
    return defaultPayment ? defaultPayment : payments[0];
  }
  

  /* mt: agregar un metodo de pago a un usuario */
  public addPaymentsForUser(idUser: number, payment: Payment & { isDefault?: boolean }): void {
    const entry = this.userPayments.find(entry => entry.idUser === idUser);

    if (entry) {

      if ( payment.isDefault ) {

        entry.payments.forEach(p => (p as any).isDefault = false);
      } else if ( entry.payments.length === 0 ) {

        payment.isDefault = true;
      }

      entry.payments.push(payment);

    } else {

      payment.isDefault = true;      
      this.userPayments.push({
        idUser: idUser,
        payments: [payment]
      });
    }
    this.savePaymentsToLocalStorage();
  }

  /*  */
  public getPaymentsByCurrentUser(): Observable<Payment[]> {
    const currentUserId = this.authService.getCurrentUser()?.idUser;
    if (!currentUserId) {
      return of([]);
    }
    return this.payments$.pipe(
      map(userEntries => {
        const entry = userEntries.find(e => e.idUser === currentUserId);
        return entry ? entry.payments : [];
      })
    );
  }

  /* mt: eliminar un metodo de pago de un usuario por indice */
  public deletePaymentForUser(idUser: number, index: number): void {
    const entry = this.userPayments.find(entry => entry.idUser === idUser);

    if (entry && entry.payments[index]) {
      entry.payments.splice(index, 1);
      this.savePaymentsToLocalStorage();
    }
  }

  /* mt: actualizar un metodo existente */
  public updatePaymentForUser(idUser: number, index: number, updatedPayment: Payment): void {
    const entry = this.userPayments.find(entry => entry.idUser === idUser);

    if (entry && entry.payments[index]) {
      entry.payments[index] = updatedPayment;
      this.savePaymentsToLocalStorage();
    }
  }

}