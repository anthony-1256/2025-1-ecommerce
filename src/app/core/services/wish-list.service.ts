/* wish-list.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
    Observable,
    of,
    BehaviorSubject,
    tap,
    map
} from 'rxjs';

import { catchError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Wishlist } from '../models/wishList.model';


@Injectable({
  providedIn: 'root'
})
export class WishlistService {

  private baseUrl = `${ environment.baseUrl }/wish-list`;
  private wishlistSubject = new BehaviorSubject< Wishlist | null >( null );
  public wishlist$ = this.wishlistSubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) { }

  getWishlist(): Observable< Wishlist | null > {
    return this.httpClient
      .get< Wishlist >( `${ this.baseUrl }` )
      .pipe(
        tap( res => this.wishlistSubject.next( res ) ),
        catchError(() => {
          this.wishlistSubject.next( null );
          return of( null );
        })
      );
  } /* end getWishlist */
  
  addToWishlist( productId: string, tags: string[] = [] ): Observable< Wishlist | null > {
    return this.httpClient
      .post< Wishlist >( `${ this.baseUrl }/add`, { productId, tags } )
      .pipe(
        tap( res => this.wishlistSubject.next( res ) ),
        catchError(() => of( null ))
      );
  } /* end addToWishlist */

  removeFromWishlist( productId: string ): Observable< Wishlist | null > {
    return this.httpClient
      .delete< Wishlist >( `${ this.baseUrl }/remove/${ productId }` )
      .pipe(
        tap( res => this.wishlistSubject.next( res ) ),
        catchError(() => of( null ))
      );
  } /* end removeFromWishlist */

  clearWishlist(): Observable< Wishlist | null > {
    return this.httpClient
      .delete< Wishlist >( `${ this.baseUrl }/clear` )
      .pipe(
        tap( res => this.wishlistSubject.next( res ) ),
        catchError(() => of( null ))
      );
  } /* end clearWishlist */

  checkProductInWishlist( productId: string ): Observable< boolean > {
    return this.httpClient
      .get<{ inWishlist: boolean }>( `${ this.baseUrl }/check/${ productId }` )
      .pipe(
        map( res => res.inWishlist ),
        catchError(() => of( false ))
      );
  } /* end checkProductInWishlist */

  moveToCart( productId: string ): Observable< Wishlist | null > {
    return this.httpClient
      .post< Wishlist >( `${ this.baseUrl }/move-to-cart`, { productId } )
      .pipe(
        tap( res => this.wishlistSubject.next( res ) ),
        catchError(() => of( null ))
      );
  } /* end moveToCart */

} /* end WishlistService */