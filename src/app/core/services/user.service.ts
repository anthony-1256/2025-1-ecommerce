/* user.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Role, User, userSchema } from '../../core/models/user.model';
import { environment } from '../../../environments/environment';

export interface UserPagination {
  users: User[],
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters?: {
    searchTerm: string | null;
    role: string | null;
    isActive: boolean | string | undefined;
    sort: string;
    order: 'asc' | 'desc';
  };
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private baseUrl = `${ environment.baseUrl }/users`;

  constructor( private httpClient: HttpClient ) { }

  getUsers(): Observable<UserPagination> {  // <-- cambiar tipo de retorno
    return this.httpClient.get<UserPagination>(`${this.baseUrl}`).pipe(
      map((data) => {
        const validatedUsers = data.users.map((user) => {
          const response = userSchema.safeParse(user);
          if (!response.success) {
            console.log(response.error);
            throw new Error(`${response.error}`);
          }
          return response.data;
        });

        return {
          ...data,
          users: validatedUsers
        };
      })
    );
  } /* end getUsers */

  getUserById(userId: string): Observable<User> {
    return this.httpClient.get<{ user: User }>(`${this.baseUrl}/${userId}`).pipe(
      map((data) => {
        const response = userSchema.safeParse(data.user);
        if (!response.success) {
          console.log(response.error);
          throw new Error(`${response.error}`);
        }
        return response.data;
      })
    );
  } /* end getUserById */

  updateUser( userId: string, user: User ): Observable<User> {
    return this.httpClient.put<{ user: User }>( `${ this.baseUrl }/${ userId }`, user ).pipe(
      map(( data ) => {
        const response = userSchema.safeParse( data.user );

        if ( !response.success ) {
          
          console.log( response.error );

          throw new Error(`${ response.error }`);
        }
        return response.data;
      })
    )
  } /* end updateUser */

  deleteUser( userId: string ): Observable<void> {
    return this.httpClient.delete<void>(`${ this.baseUrl }/${ userId }`);
  } /* end deleteUser */

  updateUserRole( userId: string, role: Role ): Observable<User> {
    return this.httpClient.patch<{ user: User }>(
      `${ this.baseUrl }/${ userId }/role`,
      { role }
    ).pipe(
      map(( data ) => {
        const response = userSchema.safeParse( data.user );

        if ( !response.success ) {
          console.log( response.error );

          throw new Error(`${ response.error }`);
        }

        return response.data;
      })
    );
  } /* end updateUserRole */

  getProfile(): Observable<User> {
    return this.httpClient.get<{ user: User }>(`${ this.baseUrl }/profile`).pipe(
      map(( data ) => {
        const response = userSchema.safeParse( data.user );

        if ( !response.success ) {
          console.log( response.error );
          throw new Error(`${ response.error }`);
        }

        return response.data;
      })
    );
  } /* end getProfile */

  updateProfile( user: Partial<User> ): Observable<User> {
    return this.httpClient.put<{ user: User }>(
      `${ this.baseUrl }/profile`,
      user
    ).pipe(
      map(( data ) => {
        const response = userSchema.safeParse( data.user );

        if ( !response.success ) {
          console.log( response.error );
          throw new Error(`${ response.error }`);
        }

        return response.data;
      })
    );
  } /* end updateProfile */

  changePassword( data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  } ): Observable<void> {
    return this.httpClient.put<void>(
      `${ this.baseUrl }/change-password`,
      data
    );
  } /* end changePassword */

  toggleUserStatus( userId: string ): Observable<User> {
    return this.httpClient.patch<{ user: User }>(
      `${ this.baseUrl }/${ userId }/toggle-status`,
      {}
    ).pipe(
      map(( data ) => {
        const response = userSchema.safeParse( data.user );

        if ( !response.success ) {
          console.log( response.error );
          throw new Error(`${ response.error }`);
        }

        return response.data;
      })
    );
  } /* end toggleUserStatus */

  searchUsers( params: {
    q?: string;
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } ): Observable< UserPagination > {
    
    /* ajustar params antes de enviarlos */
    const httpParams = new HttpParams({
      fromObject: Object.fromEntries(
        Object.entries(params).map(([key, value]) => [key, value?.toString() ?? ''])
      )
    });
    
    return this.httpClient.get<UserPagination>(`${this.baseUrl}/search`, { params: httpParams }).pipe(
      map((data) => {
        const validatedUsers = data.users.map((user) => {
        
          const response = userSchema.safeParse(user);
          if (!response.success) {
          
            console.log(response.error);
            throw new Error(`${response.error}`);
          }
          return response.data;
        });
      
        return {
          ...data,
          users: validatedUsers
        };
      })
    );
  } /* end searchUsers */

} /* end UserService */