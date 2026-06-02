/* sales.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import {
  Sale,
  SalesByProduct,
  SalesByCategory,
  SalesByBrand,
  SalesByTime,
  TopSellingProduct
} from '../../core/models/sale.model';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  private readonly baseUrl = `${ environment.baseUrl }/sales`;
  
  constructor(
    private httpClient: HttpClient
  ) { }

  getTotalSalesByProduct(): Observable<SalesByProduct[]> {
    return this.httpClient
      .get<SalesByProduct[]>(`${this.baseUrl}/products`)
      .pipe(
        catchError(error => throwError(() => error))
      );
  } /* end getTotalSalesByProduct */
  
  getSalesByUser(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Observable< Sale[] > {

    const params = new HttpParams({
      fromObject: {
        userId,
        ...( startDate && { startDate }),
        ...( endDate && { endDate }),
      }
    });
    
    return this.httpClient
      .get<Sale[]>(`${this.baseUrl}/user`, { params })
      .pipe(
        catchError(error => throwError(() => error))
      );
  } /* end getSalesByUser */
  
  getSalesByCategory(
    startDate?: string,
    endDate?: string
  ): Observable< SalesByCategory[] > {

    const params = new HttpParams({
      fromObject: {
        ...( startDate && { startDate }),
        ...( endDate && { endDate }),
      }
    });

    return this.httpClient
      .get< SalesByCategory[] >( `${ this.baseUrl }/category`, { params })
      .pipe(
        catchError( error => throwError( () => error ))
      );
  } /* end getSalesByCategory */
  
  getSalesByBrand( startDate?: string, endDate?: string ): Observable< SalesByBrand[] > {
    const params = new HttpParams({
      fromObject: {
        ...( startDate && { startDate }),
        ...( endDate && { endDate })
      }
    });

    return this.httpClient
      .get< SalesByBrand[] >( `${this.baseUrl }/brand`, { params })
      .pipe( catchError( error => throwError( () => error )));
  } /* end getSalesByCategory */

  getSalesByTime( startDate?: string, endDate?: string ): Observable< SalesByTime[] > {
    const params = new HttpParams({
      fromObject: {
        ...( startDate && { startDate }),
        ...( endDate && { endDate })
      }
    });

    return this.httpClient
      .get< SalesByTime[] >( `${ this.baseUrl }/time`, { params })
      .pipe( catchError( error => throwError( () => error )));
  } /* end getSalesByTime */

  getTopSellingProducts( limit?: number, startDate?: string, endDate?: string ): Observable< TopSellingProduct[] > {
    const params = new HttpParams({
      fromObject: {
        ...( limit != null && { limit: limit.toString() }),
        ...( startDate && { startDate }),
        ...( endDate && { endDate })
      }
    });

    return this.httpClient
      .get< TopSellingProduct[] >( `${this.baseUrl }/top-products`, { params })
      .pipe( catchError( error => throwError( () => error )));
  } /* end getTopSellingProducts */

  registerSale( data: {
    userId: string;
    _id: string;
    quantity: number;
    unitPrice: number;
  }): Observable< Sale > {
    return this.httpClient
      .post< Sale >( `${this.baseUrl}`, data )
      .pipe( catchError( error => throwError( () => error )));
  } /* end registerSale */

  getSales(): Observable< Sale[] > {
    return this.httpClient
      .get< Sale[] >( this.baseUrl )
      .pipe(
        catchError( error => throwError( () => error ))
      )
  } /* end getSales */

}/* end SalesService */