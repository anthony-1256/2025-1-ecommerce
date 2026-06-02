/* product.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, map, catchError, throwError, tap, BehaviorSubject } from 'rxjs';

import { Product } from '../../core/models/product.model';
import { environment } from '../../../environments/environment.development';
import { Capacity, Speed } from '../../core/types/enums';

export type ProductFilters = {
  name?: string;
  brandId?: string;
  model?: string;
  description?: string;
  category?: string; /* Id de la categoría */  
  capacity?: string;
  speed?: string;
  sku?: string;
  priceMin?: number;
  priceMax?: number;
  available?: boolean;
  page?: number; /* *** */
  limit?: number; /* *** */
  sort?: string; /* *** */  
  order?: 'asc' | 'desc'; /* *** */
};

export type ProductPagination = {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filtersApplied?: ProductFilters;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productSubject.asObservable();

  private readonly baseUrl = `${ environment.baseUrl }/products`;

  constructor(
    private httpClient: HttpClient
  ) {}

  getProducts(page: number = 1, limit: number = 10): Observable<Product[]> {
    let params = new HttpParams().set('page', page.toString()).set('limit', limit.toString());
  
    return this.httpClient
      .get<{ products: Product[] }>(this.baseUrl, { params })
      .pipe(
        map(response => response.products),
        tap(products => this.productSubject.next(products ?? [])),
        catchError(error => {
          this.productSubject.next([]);
          return throwError(() => new Error(error));
      })
    );
  } /* end getProducts */

  getProductById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`${this.baseUrl}/${id}`);
  } /* end getProductById */

  searchProducts(filters: ProductFilters): Observable<ProductPagination> { /* ajuste aquí: retorno tipado */
    let params = new HttpParams();
    const validFilters: ProductFilters = { ...filters }; /* ajuste aquí: ya tipado */

    if (
      validFilters.capacity &&
      !Object.values(Capacity).map(v => v.toString()).includes(validFilters.capacity)
    ) {
      delete validFilters.capacity; /* *** */
    }

    if (
      validFilters.speed &&
      !Object.values(Speed).map(v => v.toString()).includes(validFilters.speed)
    ) {
      delete validFilters.speed; /* *** */
    }

    Object.entries(validFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString()); /* ajuste aquí */
      }
    });

    return this.httpClient
      .get<ProductPagination>(`${this.baseUrl}/search`, { params }) /* ajuste aquí: tipado */
      .pipe(
        tap(() => {
          // filtersApplied ya está tipado en ProductPagination /* ajuste aquí */
        }),
        catchError(error => throwError(() => new Error(error)))
      );
  } /* end searchProducts */

  createProduct(product: Omit< Product, '_id' >): Observable<Product> {
    return this.httpClient.post<Product>(`${this.baseUrl}`, product).pipe(
      tap(newProduct => {
        console.log('Producto creado:', newProduct);
      }),
      catchError(error => {
        console.error('[ProductService] Error en createProduct:', error);
        return throwError(() => new Error(error.error?.message || 'Error al crear producto'));
      })
    );
  } /* end createProduct */

  updateProduct(productId: string, updatedProduct: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.baseUrl}/${productId}`, updatedProduct).pipe(
      tap(product => {
        console.log('Producto actualizado:', product);
      }),
      catchError(error => {
        console.error('[ProductService] Error en updateProduct', error);
        return throwError(() => new Error(error.error?.message || 'Error al actualizar producto'));
      })
    );
  } /* end updateProduct */

  deleteProduct(productId: string): Observable<{ message: string; productId: string }> {
    return this.httpClient.delete<{ message: string; productId: string }>(`${this.baseUrl}/${productId}`).pipe(
      tap(res => {
        console.log('Producto eliminado:', res.productId, res.message);
      }),
      catchError(error => {
        console.error('[ProductService] Error en deleteProduct', error);
        return throwError(() => new Error(error.error?.message || 'Error al eliminar producto'));
      })
    );
  } /* end deleteProduct */

} /* end product.service.ts */