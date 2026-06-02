/* cart.service.ts */
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,  
  catchError,
  map,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';

import { Cart } from '../../core/models/cart.model';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.development';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private readonly baseUrl = `${ environment.baseUrl }/cart`;

  private cartSubject = new BehaviorSubject<Cart | null>( null );

  public cart$ = this.cartSubject.asObservable();

  constructor(
    private httpClient: HttpClient,
    private authService: AuthService,
    private toast: ToastService
  ) {
    this.loadUserCart();
  }  
  
  private getUserId(): string {
    const user = this.authService.getCurrentUser();
    return user?._id ?? '';
  } /* end getUserId */

  getCartByUserId ( userId: string ): Observable< Cart | null > {
    return this.httpClient.get< Cart >( `${ this.baseUrl }/user/${ userId }`).pipe(
      map(( cart ) => cart),
      catchError(() => of( null ))
    );
  } /* end getCartByUserId */

  loadUserCart(): void {
    const userId = this.getUserId();

    if ( !userId ) {
      this.cartSubject.next( null );
      return;
    }

    this.getCartByUserId( userId ).subscribe({
      next: ( cart ) => {
        this.cartSubject.next( cart );
      },
      error: () => {
        this.cartSubject.next( null );
      }
    });
  } /* end loadUserCart */

  addToCart( productId: string, quantity: number = 1 ): Observable< Cart | null > {
    const userId = this.getUserId();

    if ( !userId ) {
      console.log( 'usuario no autenticado' );
      return of( null );
    }

    const payload = {
      userId,
      productId,
      quantity
    };

    return this.httpClient.post< Cart >( `${ this.baseUrl }/add-product`, payload ).pipe(
      switchMap(() => this.getCartByUserId( userId )),
      tap(( updatedCart ) => {
        this.cartSubject.next( updatedCart );
        this.toast.success( 'Producto agregado al carrito' );        
      }),
      catchError(() => of( null ))
    );
  } /* end addToCart */

  removeFromCart( productId: string ): Observable< Cart | null > {
    const userId = this.getUserId();

    if ( !userId ) {
      console.log( 'Usuario no autenticado' );
      return of( null );
    }

    const payload = {
      userId,
      productId
    };

    return this.httpClient.delete<Cart>( `${ this.baseUrl }/remove-product`, {
      body: payload
    }).pipe(
      switchMap(() => this.getCartByUserId( userId )),
      tap(( updatedCart ) => {
        this.cartSubject.next( updatedCart );
        this.toast.success( 'Producto eliminado del carrito' );
      }),
      catchError(() => of( null ))
    );
  } /* end removeFromCart */

  clearCart(): Observable< null > {
    const cartId = this.cartSubject.value?._id;

    if ( !cartId ){
      return of(null);
    }

    return this.httpClient.delete< void >(`${ this.baseUrl }/${ cartId }`).pipe(
      tap(() => {
        this.cartSubject.next(null);
        this.toast.success( 'Carrito eliminado' );
      }),
      map(() => null),
      catchError(() => of( null))
    );
  } /* end clearCart */

  getItemCount(): Observable< number > {
    return this.cart$.pipe(
      map(( cart ) => {
        if ( !cart || cart.items.length === 0 ) {
          return 0;
        }

        return cart.items.reduce(
          ( total, item ) => total + item.quantity,
          0
        );
      })
    );
  } /* end getItemCount */  
  
  getCartSnapshot(): Cart | null {
    return this.cartSubject.value;
  } /* end getCartSnapshot */

  getCartTotal(): Observable< number > {
    return this.cart$.pipe(
      map(( cart ) => {
        if ( !cart || cart.items.length === 0 ) {
          return 0;
        }

        return cart.items.reduce(( total, item ) => {
          const price = item.product.price ?? 0;
          return total + ( price * item.quantity );
        }, 0);
      })
    );
  } /* end getCartTotal */

} /* end cart.service.ts */
