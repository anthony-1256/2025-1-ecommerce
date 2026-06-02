/* category.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  BehaviorSubject,
  Observable,
  catchError,
  map,
  of,
  tap,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { Category } from '../../core/models/category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly baseUrl = `${ environment.baseUrl }/categories`;

  private categorySubject = new BehaviorSubject<Category[]>([]);

  public categories$ = this.categorySubject.asObservable();

  constructor(
    private httpClient: HttpClient
  ) {}
  
  getCategories(): Observable<Category[]> {

    return this.httpClient
      .get<Category[]>(this.baseUrl)
      .pipe(

        tap((categories) => {
          this.categorySubject.next(categories ?? []);
        }),

        map((categories) => categories ?? []),

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en getCategories: ',
            error
          );

          this.categorySubject.next([]);

          return of([]);
        })
      );

  } /* end getCategories */

  getCategoryById(id: string): Observable<Category> {

    return this.httpClient
      .get<Category>(`${ this.baseUrl }/${ id }`)
      .pipe(

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en getCategoryById: ',
            error
          );

          return throwError(() => error);

        })
      );

  } /* end getCategoryById */

  createCategory(category: Category): Observable<Category> {

    return this.httpClient
      .post<Category>(this.baseUrl, category)
      .pipe(

        tap((newCategory) => {

          const currentCategories = this.categorySubject.value ?? [];

          this.categorySubject.next([
            ...currentCategories,
            newCategory
          ]);

        }),

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en createCategory: ',
            error
          );

          return throwError(() => error);

        })
      );

  } /* end createCategory */
  
  updateCategory(
    id: string,
    category: Category
  ): Observable<Category> {

    return this.httpClient
      .put<Category>(
        `${ this.baseUrl }/${ id }`,
        category
      )
      .pipe(

        tap((updatedCategory) => {

          const updatedCategories = (
            this.categorySubject.value ?? []
          ).map((currentCategory) =>

            currentCategory._id === updatedCategory._id
              ? updatedCategory
              : currentCategory
          );

          this.categorySubject.next(updatedCategories);

        }),

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en updateCategory: ',
            error
          );

          return throwError(() => error);

        })
      );

  } /* end updateCategory */

  deleteCategory(id: string): Observable<void> {

    return this.httpClient
      .delete<void>(`${ this.baseUrl }/${ id }`)
      .pipe(

        tap(() => {

          const filteredCategories = (
            this.categorySubject.value ?? []
          ).filter(
            category => category._id !== id
          );

          this.categorySubject.next(filteredCategories);

        }),

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en deleteCategory: ',
            error
          );

          return throwError(() => error);

        })
      );

  } /* end deleteCategory */

  searchCategories(params: {
    q?: string;
    parentCategory?: string;
    sort?: string;
    order?: string;
    limit?: number;
    page?: number;
  }): Observable<{
    categories: Category[];
    pagination: any;
    filters: any;
  }> {

    return this.httpClient
      .get<{
        categories: Category[];
        pagination: any;
        filters: any;
      }>(
        `${ this.baseUrl }/search`,
        {
          params: params as any
        }
      )
      .pipe(

        map((response) => response),

        catchError((error) => {

          console.error(
            '[ CategoryService ] Error en searchCategories: ',
            error
          );

          return throwError(() => error);

        })
      );

  } /* end searchCategories */

} /* end CategoryService */