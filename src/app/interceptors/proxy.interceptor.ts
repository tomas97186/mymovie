import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProxyInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // except for /login endpoint
    if (!request.url.startsWith(environment.apiUrl)) {
      return next.handle(request);
    }
    // edit request
    request = request.clone({
      // bring token from sessionStorage and add as header
      setHeaders: {
        'x-proxy-key': `${environment.proxySecret}`,
      },
    });
    return next.handle(request);
  }
}
