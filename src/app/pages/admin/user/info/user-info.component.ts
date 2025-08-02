import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserProfile } from 'src/app/models/user-profile.model';
import { ProfileService } from 'src/app/services/profile.service';

declare var lucide: any;

@Component({
  selector: 'app-user-info',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit, OnDestroy, AfterViewInit{
  // Propiedades para almacenar el estado del componente
  userProfile: UserProfile | null = null;
  isLoading = true;
  error: string | null = null;

  // Array para almacenar las suscripciones y limpiarlas al destruir el componente
  private subscriptions: Subscription = new Subscription();

  constructor(
    private profileService: ProfileService,
    private cdr: ChangeDetectorRef // Detector de cambios para los iconos
  ) { }

  ngOnInit(): void {
    // Cuando el componente se inicializa, llamamos al servicio para obtener el perfil
    const profileSubscription = this.profileService.getMyProfile().subscribe({
      next: (data) => {
        // En caso de éxito, guardamos los datos y desactivamos el spinner
        this.userProfile = data;
        this.isLoading = false;
      },
      error: (err) => {
        // En caso de error, guardamos el mensaje y desactivamos el spinner
        this.error = err.message || 'Ocurrió un error al cargar el perfil.';
        this.isLoading = false;
        console.error(err);
      }
    });

    // Añadimos la suscripción a nuestra lista para poder limpiarla después
    this.subscriptions.add(profileSubscription);
  }

  ngAfterViewInit(): void {
    // Este hook se ejecuta después de que la vista del componente se ha renderizado.
    // Es el momento ideal para inicializar librerías de terceros como Lucide.
    this.subscriptions.add(
      this.profileService.isLoadingSubject.subscribe(isLoading => {
        if (!isLoading && this.userProfile) {
          // Forzamos la detección de cambios y luego creamos los iconos.
          // Esto asegura que los elementos `<i>` ya existen en el DOM.
          this.cdr.detectChanges();
          lucide.createIcons();
        }
      })
    );
  }

  ngOnDestroy(): void {
    // Al destruir el componente, nos desuscribimos de todos los observables
    // para prevenir fugas de memoria.
    this.subscriptions.unsubscribe();
  }
}
