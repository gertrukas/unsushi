import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import {NgxPermissionsService} from "ngx-permissions";

export type UserType = UserModel | undefined;

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {
  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/
  private authLocalStorageToken = `${environment.appVersion}-${environment.USERDATA_KEY}`;

  private expirationTimeout: any; // Nuevo: temporizador para manejar la expiración del token

  // public fields
  currentUser$: Observable<UserType>;
  isLoading$: Observable<boolean>;
  currentUserSubject: BehaviorSubject<UserType>;
  isLoadingSubject: BehaviorSubject<boolean>;

  get currentUserValue(): UserType {
    return this.currentUserSubject.value;
  }

  set currentUserValue(user: UserType) {
    this.currentUserSubject.next(user);
  }

  constructor(
    private permissionsService: NgxPermissionsService,
    private authHttpService: AuthHTTPService,
    private router: Router
  ) {
    this.isLoadingSubject = new BehaviorSubject<boolean>(false);
    this.currentUserSubject = new BehaviorSubject<UserType>(undefined);
    this.currentUser$ = this.currentUserSubject.asObservable();
    this.isLoading$ = this.isLoadingSubject.asObservable();
    const subscr = this.getUserByToken().subscribe();
    this.unsubscribe.push(subscr);
  }

  // public methods
  login(email: string, password: string): Observable<UserType> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.login(email, password).pipe(
      map((auth: AuthModel) => {
        this.setAuthFromLocalStorage(auth); // Solo llamas a la función pero no retornas el booleano
        return auth; // Retornas el `auth` original para que el flujo siga correctamente
      }),
      tap((auth: AuthModel) => {
        if (auth && auth.authToken) {
          this.setSession(auth.authToken);  // Configura la expiración del token
        }
      }),
      switchMap(() => this.getUserByToken()),
      catchError((err) => {
        console.error('err', err);
        return of(err);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  logout() {
    localStorage.removeItem(this.authLocalStorageToken);
    sessionStorage.removeItem(this.authLocalStorageToken); // Por si también quieres eliminar de sessionStorage
    clearTimeout(this.expirationTimeout);  // Limpiar el temporizador de expiración del token
    this.router.navigate(['/auth/login'], {
      queryParams: {},
    });
  }

  // Configura la expiración del token
  private setSession(token: string) {
    const decodedToken: any = jwtDecode(token);
    const expirationDate = new Date(0);
    expirationDate.setUTCSeconds(decodedToken.exp);

    const expiresIn = expirationDate.getTime() - new Date().getTime();
    console.log(expiresIn)

    // Configura el temporizador para cerrar sesión automáticamente
    this.expirationTimeout = setTimeout(() => {
      this.handleTokenExpired();
    }, expiresIn);
  }

  private handleTokenExpired() {
    this.logout();  // Cierra sesión cuando el token haya expirado
  }

  getUserByToken(): Observable<UserType> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }

    this.isLoadingSubject.next(true);
    return this.authHttpService.getUserByToken(auth.authToken).pipe(
      map((user: UserType) => {
        if (user) {
          if (user && user.roles) {
            const permissions = user.roles.flatMap(role =>
              role.permissions ? role.permissions.map(p => p.code) : []
            );
            this.permissionsService.loadPermissions(permissions);
            localStorage.setItem('userPermissions', JSON.stringify(permissions));
          } else {
            this.permissionsService.flushPermissions();
          }
          this.currentUserSubject.next(user);
        } else {
          this.logout();
        }
        return user;
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  // need create new user then login
  registration(user: UserModel): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.authHttpService.createUser(user).pipe(
      map(() => {
        this.isLoadingSubject.next(false);
      }),
      switchMap(() => this.login(user.email, user.password)),
      catchError((err) => {
        console.error('err', err);
        return of(undefined);
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }

  forgotPassword(email: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .forgotPassword(email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  resetPassword(params: any): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .resetPassword(params)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  changePassword(id: string, params: any): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .changePassword(auth.authToken, id, params)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  changeEmail(id: string, email: string): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .changeEmail(auth.authToken, id, email)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  updateUser(id: string, params: any): Observable<any> {
    const auth = this.getAuthFromLocalStorage();
    if (!auth || !auth.authToken) {
      return of(undefined);
    }
    this.isLoadingSubject.next(true);
    return this.authHttpService
      .updateUser(auth.authToken, id, params)
      .pipe(finalize(() => this.isLoadingSubject.next(false)));
  }

  // private methods
  private setAuthFromLocalStorage(auth: AuthModel): boolean {
    // store auth authToken/refreshToken/epiresIn in local storage to keep user logged in between page refreshes
    if (auth && auth.authToken) {
      localStorage.setItem(this.authLocalStorageToken, JSON.stringify(auth));
      this.setSession(auth.authToken);  // Configura la expiración del token al guardar el token
      return true;
    }
    return false;
  }

  getAuthFromLocalStorage(): AuthModel | undefined {
    try {
      const lsValue = localStorage.getItem(this.authLocalStorageToken);
      if (!lsValue) {
        return undefined;
      }

      const authData = JSON.parse(lsValue);
      return authData;
    } catch (error) {
      console.error(error);
      return undefined;
    }
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
    clearTimeout(this.expirationTimeout); // Limpiar el temporizador al destruir el servicio
  }
}
