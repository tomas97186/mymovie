import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { environment } from "src/environments/environment";


interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private http = inject(HttpClient);
  private tokenKey = 'jwt_token';
  private expKey = 'jwt_exp';

  constructor() {}

  /**
   * Recupera il token attuale (se valido), altrimenti ne richiede uno nuovo
   */
  async getToken(): Promise<string | null> {
    const token = localStorage.getItem(this.tokenKey);
    const exp = localStorage.getItem(this.expKey);

    if (token && exp && Date.now() < +exp * 1000) {
      return token;
    }

    return this.refreshToken();
  }

  /**
   * Richiede un nuovo token al proxy
   */
  private async refreshToken(): Promise<string | null> {
    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${environment.apiUrl}/auth`, {
          apiKey: environment.proxySecret
        }, {
            headers: {
                'Content-Type':  'application/json',
                
            }
        })
      );

      const token = res.token;

      // Decodifica payload per estrarre exp
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp; // timestamp in secondi

      localStorage.setItem(this.tokenKey, token);
      localStorage.setItem(this.expKey, exp);

      return token;
    } catch (err) {
      console.error('Errore durante il refresh token', err);
      return null;
    }
  }

  /**
   * Rimuove il token salvato
   */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expKey);
  }
}