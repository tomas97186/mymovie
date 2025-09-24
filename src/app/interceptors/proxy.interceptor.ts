import { inject, Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthTokenService } from '../services/auth-token.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const auth = inject(AuthService);
    // except for /login endpoint
    if (
      !request.url.startsWith(environment.apiUrl) ||
      request.url.endsWith('auth')
    ) {
      return next.handle(request);
    }
    return from(auth.currentUser$).pipe(
      filter(user => !!user),
      switchMap((user) => user.getIdToken()),
      switchMap((token) => {
        // edit request
        request = request.clone({
          // bring token from sessionStorage and add as header
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next.handle(request);
      })
    );
  }
}
