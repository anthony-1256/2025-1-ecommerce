/* address.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {  
  Observable,
  catchError,
  of,
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { Address } from '../../core/models/address.model';

@Injectable({
  providedIn: 'root'
})
export class AddressService {  

  private baseUrl = `${ environment.baseUrl }/address`;

  constructor(
    private httpClient: HttpClient
  ) {}

  getAddressesByUser(): Observable< Address[] > {
    return this.httpClient
      .get< Address[] >( `${ this.baseUrl }`)
      .pipe(
        catchError(() => of([]))
      );
  } /* end getAddresses */

  getDefaultAddress( ): Observable< Address | null > {
    return this.httpClient
    .get< Address >( `${ this.baseUrl }/default`)
      .pipe(
        catchError(() => of(null))
      );
  } /* end getDefaultAddress */

  getAddressById( id: string ): Observable< Address | null > {
    return this.httpClient
      .get< Address >( `${ this.baseUrl }/${ id }`)
      .pipe(
        catchError(() => of(null))
      );
  } /* end getAddressById */

  createAddress(address: Omit<Address, '_id'>): Observable<Address> {
    return this.httpClient
      .post<Address>(`${ this.baseUrl }`, address)
      .pipe(
        catchError(() => of({} as Address))
      );
  } /* end createAddress */

  updateAddress(id: string, address: Partial<Address>): Observable<Address> {
    return this.httpClient
      .put<Address>(`${ this.baseUrl }/${ id }`, address)
      .pipe(
        catchError(() => of({} as Address))
      );
  } /* end updateAddress */

  setDefaultAddress(id: string): Observable<Address> {
    return this.httpClient
      .patch<Address>(`${ this.baseUrl }/${ id }/set-default`, {})
      .pipe(
        catchError(() => of({} as Address))
      );
  } /* end setDefaultAddress */

  deactivateAddress(id: string): Observable<Address> {
    return this.httpClient
      .patch<Address>(`${ this.baseUrl }/${ id }/deactivate`, {})
      .pipe(
        catchError(() => of({} as Address))
      );
  } /* end deactivateAddress */

  deleteAddress(id: string): Observable<void> {
    return this.httpClient
      .delete<void>(`${ this.baseUrl }/${ id }`)
      .pipe(
        catchError(() => of(void 0))
      );
  } /* end deleteAddress */

} /* end AddressService */