/* order.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  map,
  catchError,
  of,
  tap,
  throwError,
  take
} from 'rxjs';

import { Order } from '../../core/models/order.model';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = `${ environment.baseUrl }/orders`;
  private ordersSubject = new BehaviorSubject< Order[] >([]);
  public orders$ = this.ordersSubject.asObservable();

  private lastOrderSubject = new BehaviorSubject< Order | null >( null );
  public lastOrder$ = this.lastOrderSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService
  ) { }

  private getUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?._id ?? '' ;
  } /* end getUserId */
  
  loadOrders(): void {
    const userId = this.getUserId();

    if ( !userId ) {
      this.ordersSubject.next([]);
      return;
    }

    this.getOrdersByUserId( userId ).pipe( take(1) ).subscribe({
      next: ( orders ) => {
        this.ordersSubject.next( orders );
      },
      error: () => {
        this.ordersSubject.next([]);
      }
    });
  } /* end loadOrders */
  
  getOrdersByUserId( userId: string ): Observable< Order[] > {
    return this.httpClient
      .get< Order[] >( `${ this.baseUrl }/user/${ userId }` )
      .pipe(
        map(( orders ) => orders ?? []),

        catchError(( error ) => {          
          console.error( 'Error fetching orders:', error );
          return of([]);
        })
      );
  } /* end getOrdersByUserId */

  createOrder( order: Order ): Observable< Order > {
    return this.httpClient
      .post< Order >( `${ this.baseUrl }`, order )
      .pipe(
        tap(( newOrder ) => {

          this.lastOrderSubject.next( newOrder );

          const currentOrders = this.ordersSubject.value ?? [];
          this.ordersSubject.next([ ...currentOrders, newOrder ]);
        }),
        catchError(( error ) => {
          console.error( '[OrderService] Error en createOrder', error );
          return throwError(() => error);
        })
      );
  } /* end createOrder */

  getLastOrder(): Order | null {
    return this.lastOrderSubject.value;
  } /* end getLastOrder */

  updateOrderStatus( orderId: string, status: Order[ 'status' ]): Observable< Order > {
    return this.httpClient
      .patch< Order >( `${ this.baseUrl }/${ orderId }/status`, { status } )
      .pipe(
        tap(( updatedOrder ) => {
          
          const updatedOrders = ( this.ordersSubject.value ?? [] ).map( order =>
            order._id === updatedOrder._id ? updatedOrder : order
          );
          
          this.ordersSubject.next( updatedOrders );
          
          if ( this.lastOrderSubject.value?._id === updatedOrder._id ) {
            this.lastOrderSubject.next( updatedOrder );
          }
        }),
        catchError(( error ) => {
          console.error( '[OrderService] Error en updateOrderStatus:', error );
          return throwError(() => error);
        })
    );
  }  /* end updateOrderStatus */

} /* end OrderService */