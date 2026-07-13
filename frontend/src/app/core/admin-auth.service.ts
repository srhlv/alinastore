import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
};

@Injectable( { providedIn: 'root' } )
export class AdminAuthService {
  private readonly http     = inject( HttpClient );
  private readonly tokenKey = 'token';
  private readonly loginUrl = '/api/admin/login';

  login( credentials: LoginCredentials ): Observable<LoginResponse> {
    return this.http.post<LoginResponse>( this.loginUrl, credentials ).pipe(
      tap( ( response ) => this.setToken( response.accessToken ) ),
    );
  }

  getToken(): string | null {
    return localStorage.getItem( this.tokenKey );
  }

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }

  logout(): void {
    localStorage.removeItem( this.tokenKey );
  }

  private setToken( token: string ): void {
    localStorage.setItem( this.tokenKey, token );
  }
}
