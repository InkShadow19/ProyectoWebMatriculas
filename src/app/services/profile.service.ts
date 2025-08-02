import { Injectable, OnDestroy } from "@angular/core";
import { BehaviorSubject, Observable, Subscription, throwError } from "rxjs";
import { catchError, finalize } from 'rxjs/operators';
import { ProfileDomainService } from "../domains/profile-domain.service";
import { UserProfile } from "../models/user-profile.model";
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root',
})
export class ProfileService implements OnDestroy {

  // Subject para notificar a los componentes si una operación está en curso.
  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  
  private unsubscribe: Subscription[] = [];

  constructor(
    private profileDomainService: ProfileDomainService,
  ) {}

  /**
   * Obtiene el perfil del usuario logueado.
   * Maneja el estado de carga y propaga los errores al componente.
   */
  getMyProfile(): Observable<UserProfile> {
    this.isLoadingSubject.next(true); // Inicia el indicador de carga

    return this.profileDomainService.getMyProfile().pipe(
      catchError((error: HttpErrorResponse) => {
        // Capturamos el error HTTP y lo relanzamos para que el componente
        // que lo consume pueda mostrar un mensaje específico al usuario.
        const errorMessage = error.error?.message || 'No se pudo cargar el perfil.';
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => {
        // Este bloque se ejecuta siempre, tanto si la llamada tuvo éxito como si falló.
        this.isLoadingSubject.next(false); // Detiene el indicador de carga
      })
    );
  }

  /**
   * Se asegura de limpiar las suscripciones para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.unsubscribe.forEach(sub => sub.unsubscribe());
  }
}
