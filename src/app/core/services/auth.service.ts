/* auth.service.ts */
import { Injectable } from '@angular/core';
import { Role } from '../../core/models/user.model';
import { BehaviorSubject, catchError, map, Observable, throwError,  } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

type DecodedToken = {
  _id: string;
  name: string;
  role: Role;
  exp?: number;
};

export type AuthenticatedUser = {
  _id: string;
  name: string;
  role: Role;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /* private baseUrl = 'http://localhost:3000/api/auth'; */ /* harcodear */
  private baseUrl = `${ environment.baseUrl }/auth`;
  private currentUserSubject = new BehaviorSubject<AuthenticatedUser | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private httpClient: HttpClient, private router: Router
  ) {}

  private saveTokens( token: string,refreshToken: string ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
  } /* end saveTokens */

  getToken(): string | null {
    return localStorage.getItem('token');
  } /* end getToken */

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  } /* end getRefreshToken */
  
  refreshAccessToken(): Observable<void> {
    const refreshToken = this.getRefreshToken();

    if ( !refreshToken ) {
      return throwError(() => new Error( 'No refresh token available' ));
    }

    return this.httpClient.post<{ token: string }>(
      `${this.baseUrl}/refresh-token`,
      { token: refreshToken }
    ).pipe(
      map(( data ) => {

        localStorage.setItem( 'token', data.token );

        this.setCurrentUserFromToken( data.token );
      })
    )
  } /* end refreshAccessToken */
  
  private removeTokens(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  } /* end removeTokens */
  
  private setCurrentUserFromToken( token: string ): void {
    const decoded = jwtDecode<DecodedToken>( token );
    
    const user: AuthenticatedUser = {
      _id: decoded._id,
      name: decoded.name,
      role: decoded.role,      
    };
    
    this.currentUserSubject.next( user );
  }/* end setCurrentUserFromToken */
  
  register( user: {
    name: string;
    email: string,
    password: string;
    phone: string;
    userName: string;
    age: number;
    sex: string;
    imgUser?: string;
  } ): Observable< void > { 
    
    return this.httpClient.post<void>(
      `${ this.baseUrl }/register`,
      user
    );
  } /* end register */

  login( email: string, password: string ): Observable<void> {
    return this.httpClient.post<{ token: string, refreshToken: string }>(
      `${ this.baseUrl }/login`,
      { email, password }
    ).pipe(
      map(( data ) => {

        this.saveTokens( data.token, data.refreshToken );

        this.setCurrentUserFromToken( data.token );

      })
    );
  } /* end login */

  getCurrentUser(): AuthenticatedUser | null {
    return this.currentUserSubject.value;
  }

  initSession(): void { /* <-- ajuste pc#0003 */
    const token = this.getToken();

    if ( !token ) return;

    try {
      const decoded = jwtDecode<DecodedToken>( token );
      const now = Math.floor( Date.now() / 1000 );

      if ( decoded.exp && decoded.exp < now ) {
        /* token expirado — intenta refresh */
        this.refreshAccessToken().pipe(
          catchError(() => {
            this.removeTokens();
            return throwError(() => new Error('Sesión expirada'));
          })
        ).subscribe();
        return;
      }

      this.setCurrentUserFromToken( token );

    } catch {
      this.removeTokens();
    }
  } /* end initSession */  
  
  logout(): void{
    this.removeTokens();
    this.currentUserSubject.next( null );
    this.router.navigate([ '/inicioSesion' ]);
  } /* end logout */

} /* end AuthService */