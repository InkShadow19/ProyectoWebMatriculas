import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError, finalize, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

// INTERFACES PARA UNA COMUNICACIÓN CLARA CON EL BACKEND

// 1. Lo que enviamos al hacer login
export interface LoginRequest {
  usuario: string;
  contrasena: string; // Asegúrate de que coincida con tu DTO (si usaste 'contrasena' sin ñ)
}

// 2. Lo que recibimos del backend tras un login exitoso
export interface UserInfo {
  token: string;
  username: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private endpoint = environment.apiUrl;

  // Mantiene el estado del usuario actual en toda la aplicación
  private currentUserSubject: BehaviorSubject<UserInfo | null>;
  public currentUser$: Observable<UserInfo | null>;
  
  // Mantiene el estado de carga para los spinners
  public isLoadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$ = this.isLoadingSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    // Al iniciar el servicio, intenta cargar al usuario desde el localStorage
    const user = localStorage.getItem('currentUser');
    this.currentUserSubject = new BehaviorSubject<UserInfo | null>(user ? JSON.parse(user) : null);
    this.currentUser$ = this.currentUserSubject.asObservable();
  }

  /**
   * Proporciona acceso al valor actual del usuario de forma síncrona.
   */
  public get currentUserValue(): UserInfo | null {
    return this.currentUserSubject.value;
  }

  /**
   * Realiza la petición de login al backend.
   * @param credentials Objeto con el usuario y la contraseña.
   * @returns Un observable con la información del usuario si el login es exitoso, o null si falla.
   */
  login(credentials: LoginRequest): Observable<UserInfo | null> {
    this.isLoadingSubject.next(true);
    return this.http.post<UserInfo>(`${this.endpoint}/auth/login`, credentials).pipe(
      tap(userInfo => {
        // Si el backend responde con un usuario y un token...
        if (userInfo && userInfo.token) {
          // 1. Guarda la información en localStorage para mantener la sesión
          localStorage.setItem('currentUser', JSON.stringify(userInfo));
          // 2. Notifica al resto de la aplicación sobre el nuevo usuario
          this.currentUserSubject.next(userInfo);
        }
      }),
      // En lugar de devolver null, ahora propagamos el error.
      catchError((err) => {
        console.error('Error en el login:', err);
        return throwError(() => err); // Pasa el objeto de error al componente
      }),
      finalize(() => {
        this.isLoadingSubject.next(false);
      })
    );
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    // 1. Limpia los datos del localStorage
    localStorage.removeItem('currentUser');
    // 2. Notifica a la aplicación que no hay nadie logueado
    this.currentUserSubject.next(null);
    // 3. Redirige a la página de login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Verifica si el usuario logueado tiene un rol específico.
   * @param role El rol a verificar (ej: 'Administrador').
   * @returns `true` si el usuario tiene el rol, `false` en caso contrario.
   */
  hasRole(role: string): boolean {
    const user = this.currentUserValue;
    return !!user && user.role === role;
  }
  
  // --- MÉTODOS AÑADIDOS PARA COMPATIBILIDAD CON LA PLANTILLA ---

  // Método para mandar notificación de recuperación de contraseña
  forgotPassword(username: string): Observable<any> {
    this.isLoadingSubject.next(true);
    return this.http.post(`${this.endpoint}/auth/forgot-password`, { username: username }).pipe(
      catchError((error) => {
        // Pasa el objeto de error completo al componente
        return throwError(() => error); 
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
  
  // Método de relleno para compatibilidad con la plantilla
  registration(user: any): Observable<any> {
    console.warn('La función de registro de la plantilla no está implementada en este flujo.');
    return of(undefined);
  }

}