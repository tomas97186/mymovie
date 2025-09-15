import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  catchError,
  first,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';
import { environment } from 'src/environments/environment';

interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private http = inject(HttpClient);
  private tokenKey = 'jwt_token';
  private expKey = 'jwt_exp';
  // cache della richiesta di refresh in corso
  private refreshInProgress$: Observable<string | null> | null = null;

  constructor() {}

  /**
   * Recupera il token attuale (se valido), altrimenti ne richiede uno nuovo
   */
  getToken(): Observable<string | null> {
    const token = localStorage.getItem(this.tokenKey);
    const exp = localStorage.getItem(this.expKey);

    if (token && exp && Date.now() < +exp * 1000) {
      return of(token);
    }

    return this.refreshToken();
  }

  /**
   * Richiede un nuovo token al proxy
   */
  private refreshToken(): Observable<string | null> {
    if (!this.refreshInProgress$) {
      // se una richiesta è già in corso → restituisci la stessa
      this.refreshInProgress$ = this.http
        .post<AuthResponse>(
          `${environment.apiUrl}/auth`,
          {
            apiKey: environment.proxySecret,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        )
        .pipe(
          first(),
          map((res) => {
            const token = res.token;

            // Decodifica payload per estrarre exp
            const payload = JSON.parse(atob(token.split('.')[1]));
            const exp = payload.exp; // timestamp in secondi

              localStorage.setItem(this.tokenKey, token);
              localStorage.setItem(this.expKey, exp);

            return token;
          }),
          catchError((err) => {
            console.error('Errore durante il refresh token', err);
            return of(null);
          }),
          shareReplay(1),
          tap(() => {
            this.refreshInProgress$ = null;
          })
        );
    }
    return this.refreshInProgress$;
  }

  /**
   * Rimuove il token salvato
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expKey);
  }
}
