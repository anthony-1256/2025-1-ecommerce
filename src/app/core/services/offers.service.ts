/* offers.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { HttpParams } from '@angular/common/http';

import { Offer } from '../../core/models/offer.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OffersService {

  private readonly baseUrl = `${ environment.baseUrl }/offers`;  

  constructor(
    private httpClient: HttpClient
  ) { }

  createOrUpdateOffer( offer: Offer ): Observable< Offer > {
    return this.httpClient.post< Offer >(
      `${this.baseUrl }`, offer
    ).pipe(
      catchError(( error ) => {
        console.error( 'Error en createOrUpdateOffer', error );
        return throwError(() => error );
      })
    );
  } /* end createOrUpdateOffer */

  getOffers(): Observable< Offer[] > {
    return this.httpClient.get< Offer[] >(
      `${this.baseUrl}`
    ).pipe(
      catchError(( error ) => {
        console.error( 'Error en getOffers', error );
        return throwError(() => error );
      })
    );
  } /* end getOffers */
  
  searchOffers( filters: {
    discountType?: 'percentage' | 'fixed';
    minDiscountValue?: number;
    maxDiscountValue?: number;
    startDate?: string; // ISO string
    endDate?: string; // ISO string
    isActive?: boolean;
  }): Observable< Offer[] > {

    let params = new HttpParams();

    if ( filters.discountType ) {
      params = params.set(
        'discountType', filters.discountType
      );
    }

    if ( filters.isActive !== undefined ) {
      params = params.set(
        'isActive', filters.isActive.toString()
      );
    }

    if ( filters.minDiscountValue !== undefined ) {
      params = params.set(
        'minDiscountValue', filters.minDiscountValue.toString()
      );
    }

    if ( filters.maxDiscountValue !== undefined ) {
      params = params.set(
        'maxDiscountValue', filters.maxDiscountValue.toString()
      );
    }

    if ( filters.startDate ) {
      params = params.set(
        'startDate', filters.startDate
      );
    }

    if ( filters.endDate ) {
      params = params.set(
        'endDate', filters.endDate
      );
    }

    return this.httpClient.get< Offer[] >(
      `${ this.baseUrl }/search`,
      { params }
    ).pipe(
      catchError(( error ) => {
        console.error( 'Error en searchOffers', error );
        return throwError(() => error );
      })
    );
  } /* end searchOffers */

  getOfferByProduct( productId: string ): Observable< Offer | null > {
    return this.httpClient.get< Offer | null >(
      `${ this.baseUrl }/product/${ productId }`
    ).pipe(
      catchError(( error ) => {
        if ( error.status === 404 ) {
          return of( null );
        }
        return throwError(() => error );
      })
    );
  } /* end getOfferByProduct */

  getProductFinalPrice( productId: string ): Observable<{
    basePrice: number;
    finalPrice: number;
    hasDiscount: boolean;
  }> {
    return this.httpClient.get<{
      basePrice: number;
      finalPrice: number;
      hasDiscount: boolean;
    }>(
      `${this.baseUrl}/product/${productId}/final-price`
    ).pipe(
      catchError(( error ) => {
        console.error( 'Error en getProductFinalPrice', error );
        return throwError(() => error );
      })
    );
  } /* end getProductFinalPrice */

  deleteOffer( productId: string) : Observable< void > {
    return this.httpClient.delete< void >(
      `${ this.baseUrl }/product/${ productId }`
    ).pipe(
      catchError(( error ) => {
        console.error( 'Error en deleteOffer', error );
        return throwError(() => error );
      })
    );
  } /* end deleteOffer */

} /* end offersService */