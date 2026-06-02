/* payment-methods.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  map,
  switchMap,
  tap,
  catchError,
  of,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { Payment } from '../../core/models/payment-method.model';

@Injectable({
  providedIn: 'root'
})
export class PaymentMethodsService {

  private paymentMethodSubject = new BehaviorSubject< Payment | null >( null );
  paymentMethod$ = this.paymentMethodSubject.asObservable();
  
  private baseUrl = `${ environment.baseUrl }/payment-methods`;

  constructor(
    private httpClient: HttpClient
  ) { }

  getPaymentMethodsByUserId( userId: string ): Observable< Payment[] > {
    return this.httpClient
      .get< Payment[] >( `${ this.baseUrl }/user/${ userId }` )
      .pipe(
        catchError(() => of([]))
      )
  } /* end getPaymentMethodsByUserId */

  getDefaultPaymentMethod( userId: string ): Observable< Payment | null > {
    return this.httpClient
      .get< Payment >( `${ this.baseUrl }/default/${ userId }` )
      .pipe(
        catchError(() => of(null))
      );
  } /* end getDefaultPaymentMethod */
  
  createPaymentMethod( payment: Payment ): Observable< Payment | null > {
    return this.httpClient
      .post< Payment >( `${ this.baseUrl }`, payment )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );
  } /* end createPaymentMethod */

  updatePaymentMethod( payment: Payment ): Observable< Payment | null> {
    
    if ( !payment._id ) {
      return of( null );
    }

    return this.httpClient
      .put< Payment >( `${ this.baseUrl }/${ payment._id }`, payment )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );
      
  } /* end updatePaymentMethod */

  setDefaultPaymentMethod( id: string ): Observable< Payment | null > {
    return this.httpClient
      .patch< Payment >( `${ this.baseUrl }/${ id }/set-default`, {} )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );
  } /* end setDefaultPaymentMethod */

  deactivatePaymentMethod( id: string ): Observable< Payment | null > {
    return this.httpClient
      .patch< Payment >( `${ this.baseUrl }/${ id }/deactivate`, {} )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );
  } /* end deactivatePaymentMethod */

  deletePaymentMethod( id :string ): Observable< void > {
    return this.httpClient
      .delete< void >( `${ this.baseUrl }/${ id }` )
      .pipe(
        catchError(() => {
          return of( void 0 );
        })
      );
  } /* end deletePaymentMethod */
  
} /* end paymentMMethodsService */
