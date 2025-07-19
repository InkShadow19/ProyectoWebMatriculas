import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, of, Subscription } from 'rxjs';
import { map, catchError, switchMap, finalize } from 'rxjs/operators';
import { UserModel } from '../models/user.model';
import { AuthModel } from '../models/auth.model';
import { AuthHTTPService } from './auth-http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface LoginRequest {
  usuario: string;
  contraseña: string;
}

export interface LoginResponse {
  message: string;
  userInfo: any; // Puedes definir una interfaz más estricta si el backend devuelve datos del usuario
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements OnDestroy {

  private API_URL = environment.apiUrl;
  
  // Mantiene el estado del usuario actual en la aplicación
  private currentUserSubject = new BehaviorSubject<any | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mantiene el estado de carga para mostrar spinners
  public isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  private unsubscribe: Subscription[] = [];

  constructor(private http: HttpClient, private router: Router) {
    // Podrías tener una lógica aquí para verificar la sesión al iniciar la app si es necesario
  }

  get currentUserValue(): any | null {
    return this.currentUserSubject.value;
  }

  login(credentials: LoginRequest): Observable<any | null> {
    this.isLoadingSubject.next(true);
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials, { withCredentials: true }).pipe(
      map(response => {
        // En un login por sesión, el éxito es una respuesta 200 OK.
        // El navegador se encarga de la cookie de sesión.
        // Aquí simulamos la data del usuario o podrías hacer otra llamada para obtenerla.
        const user = { username: credentials.usuario }; // Objeto de usuario simple
        this.currentUserSubject.next(user);
        this.isLoadingSubject.next(false);
        return user;
      }),
      catchError((err) => {
        console.error('Error en el login:', err);
        this.isLoadingSubject.next(false);
        return of(null); // Devuelve null en caso de error
      })
    );
  }

  logout() {
    this.http.post(`${this.API_URL}/auth/logout`, {}).subscribe(() => {
      this.currentUserSubject.next(null);
      this.router.navigate(['/auth/login'], {
        queryParams: {},
      });
    });
  }

  // --- MÉTODOS AÑADIDOS PARA EVITAR ERRORES DE COMPILACIÓN ---

  registration(user: any): Observable<any> {
    console.warn('La función de registro no está implementada.');
    // Devuelve un observable vacío para que el componente no se rompa
    return of(undefined);
  }

  forgotPassword(email: string): Observable<boolean> {
    console.warn('La función de olvidar contraseña no está implementada.');
    // Devuelve 'false' para que el componente no se rompa
    return of(false);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
