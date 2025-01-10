import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');

    // Comprobar si el token ha expirado antes de continuar
    if (token && this.isTokenExpired(token)) {
      // Limpiar el token del almacenamiento
      this.handleTokenExpired();
      return throwError('Token expired');
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Detectar si el error es un 401 (no autorizado o token expirado)
        if (error.status === 401) {
          this.handleTokenExpired();
        }
        return throwError(error);
      })
    );
  }

  private isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);

    return expirationDate < new Date(); // Comparar con la fecha actual
  }

  private handleTokenExpired() {
    // Limpiar el token del almacenamiento
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.clear();
    sessionStorage.clear();
    // Redirigir a la página de inicio de sesión
    // this.router.navigate(['/auth/login']);
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
    document.location.reload();
  }
}
