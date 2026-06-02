/* review.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import {
  Observable,
  catchError,
  of,
  throwError
} from 'rxjs';

import { environment } from '../../../environments/environment';
import { Review } from '../models/review.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly baseUrl = `${ environment.baseUrl }/reviews`;

  constructor(
    private httpClient: HttpClient
  ) {}

  createReview(
    review: {
      product: string;
      rating: number;
      comment?: string;
    }
  ): Observable< Review | null > {

    return this.httpClient
      .post< Review >( `${ this.baseUrl }`, review )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );

  } /* end createReview */

  getProductReviews(
    productId: string
  ): Observable< Review[] > {

    return this.httpClient
      .get< Review[] >(
        `${ this.baseUrl }/product/${ productId }`
      )
      .pipe(
        catchError(() => {
          return of([]);
        })
      );

  } /* end getProductReviews */

  getUserReviews(): Observable< Review[] > {

    return this.httpClient
      .get< Review[] >(
        `${ this.baseUrl }/my-reviews`
      )
      .pipe(
        catchError(() => {
          return of([]);
        })
      );

  } /* end getUserReviews */

  updateReview(
    reviewId: string,
    review: {
      rating: number;
      comment?: string;
    }
  ): Observable< Review | null > {

    return this.httpClient
      .put< Review >(
        `${ this.baseUrl }/${ reviewId }`,
        review
      )
      .pipe(
        catchError(() => {
          return of( null );
        })
      );

  } /* end updateReview */

  deleteReview( reviewId: string ): Observable<void> {

    return this.httpClient
      .delete<void>(`${ this.baseUrl }/${ reviewId }`)
      .pipe(
        catchError(error => {
          return throwError(() =>
            new Error(error.error?.message || 'Error al eliminar review')
          );
        })
      );

  } /* end deleteReview */

} /* end ReviewService */