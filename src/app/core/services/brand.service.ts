/* brand.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  map,
  catchError,
  of,
  tap,
  throwError
} from 'rxjs';

import { Brand } from '../../core/models/brand.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class BrandService {

  private baseUrl = `${ environment.baseUrl }/brands`;
  
  private brandSubject = new BehaviorSubject< Brand[] >( [] );
  public brands$ = this.brandSubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) { }

  getBrands(): Observable< Brand[] > {
    return this.httpClient
    .get< Brand[] >( this.baseUrl )
    .pipe(
      tap(( brands ) => { /* tap: actualiza estado */
        this.brandSubject.next( brands ?? [] );
      }),
      map(( brands ) => brands ?? [] ), /* map: siempre regresa un array */
      catchError(( error ) => { /* catchError: limpia estado y evita que reviente la app */
        console.error( `[ BrandService ] Error fetching brands: `, error );
        this.brandSubject.next([]);
        return of ([]); /* error especifico */
      })
    );
  } /* end getBrands */

  getBrandById( id: string ): Observable< Brand > {
    return this.httpClient
      .get< Brand >(`${ this.baseUrl }/${ id }` )
      .pipe(
        catchError(( error ) => {
          console.error( '[ BrandService ] Error en getBrandById: ', error );
          return throwError(() => error ); /* yo especifico error */
        })
      );
  } /* end getBrandById */

  createBrand( brand: Omit< Brand, '_id' >): Observable< Brand > {

    return this.httpClient
      .post< Brand >( `${ this.baseUrl }`, brand )
      .pipe(
        tap(( newBrand ) => {
          const current = this.brandSubject.value ?? [];
          this.brandSubject.next([ ...current, newBrand ]);
        }),
        catchError(( error ) => {
          console.error( '[ BrandService ] Error en createBrand: ', error);
          return throwError(() => error );
        })
      );
      
  } /* end createBrand */

  updateBrand( brand: Brand ): Observable< Brand > {
    return this.httpClient
      .put< Brand >( `${ this.baseUrl }/${ brand._id }`, brand )
      .pipe(
        tap(( updatedBrand ) => {
          const updated = ( this.brandSubject.value ?? [] ).map( b =>
            b._id === updatedBrand._id ? updatedBrand : b
          );
          this.brandSubject.next( updated );          
        }),
        catchError(( error ) => {
          console.error( '[ BrandService ] Error en updateBrand: ', error );
          return throwError(() => error );
        })
      );
  } /* end updateBrand */

  deleteBrand( id: string ): Observable< void > {
    return this.httpClient
    .delete< void >( `${ this.baseUrl }/${ id }` )
    .pipe(
      tap(() => {
        const filtered = ( this.brandSubject.value ?? [] )
          .filter( b => b._id !== id );

        this.brandSubject.next( filtered );
      }),
      catchError(( error ) => {
        console.error('[BrandService] Error en deleteBrand:', error);
        return throwError(() => error);
      })
    );
  } /* end deleteBrand */

  searchBrands( params: {
    q?: string;
    sort?: string;
    order: 'string';
    limit?: number;
    page?: number;
  }): Observable<{ brands: Brand[]; pagination: any; filters: any }> {

    return this.httpClient
      .get<{ brands: Brand[]; pagination: any; filters: any }>(
        `${ this.baseUrl }/search`,
        { params: params as any }
      )
      .pipe(
        map(( response ) => response ),
        catchError(( error ) => {
          console.error( '[ BrandService ] Error en searchBrands', error );
          return throwError(() => error );
        })
      );
  } /* end searchBrands */
  
} /* end BrandService */