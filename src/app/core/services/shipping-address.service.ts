/* shipping-address.service.ts */
import { Injectable } from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  Observable,
  catchError,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment.development';

import {
  ShippingAddress
} from '../models/shipping-address.model';

@Injectable({
  providedIn: 'root'
})
export class ShippingAddressService {

  private readonly baseUrl =
    `${ environment.baseUrl }/shipping-address`;

  constructor(
    private httpClient: HttpClient
  ) { }

  getUserAddresses(): Observable<{
    addresses: ShippingAddress[]
  }> {

    return this.httpClient
      .get<{
        addresses: ShippingAddress[]
      }>(`${ this.baseUrl }`)
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end getUserAddresses */

  getAddressById(
    addressId: string
  ): Observable< ShippingAddress > {

    return this.httpClient
      .get< ShippingAddress >(
        `${ this.baseUrl }/${ addressId }`
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end getAddressById */

  getDefaultAddress(): Observable< ShippingAddress > {

    return this.httpClient
      .get< ShippingAddress >(
        `${ this.baseUrl }/default`
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end getDefaultAddress */

  createShippingAddress(
    data: {
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      isDefault: boolean;
      addressType: 'home' | 'work' | 'other';
    }
  ): Observable< ShippingAddress > {

    return this.httpClient
      .post< ShippingAddress >(
        `${ this.baseUrl }`,
        data
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end createShippingAddress */

  updateShippingAddress(
    addressId: string,
    data: {
      name: string;
      address: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
      isDefault: boolean;
      addressType: 'home' | 'work' | 'other';
    }
  ): Observable< ShippingAddress > {

    return this.httpClient
      .put< ShippingAddress >(
        `${ this.baseUrl }/${ addressId }`,
        data
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end updateShippingAddress */

  setDefaultAddress(
    addressId: string
  ): Observable< ShippingAddress > {

    return this.httpClient
      .patch< ShippingAddress >(
        `${ this.baseUrl }/${ addressId }/default`,
        {}
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end setDefaultAddress */

  deleteShippingAddress(
    addressId: string
  ): Observable< void > {

    return this.httpClient
      .delete< void >(
        `${ this.baseUrl }/${ addressId }`
      )
      .pipe(
        catchError(
          error => throwError(() => error)
        )
      );

  } /* end deleteShippingAddress */

} /* end ShippingAddressService */