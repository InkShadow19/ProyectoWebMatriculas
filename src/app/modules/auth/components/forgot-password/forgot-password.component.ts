import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';

enum States { // Renombrado para más claridad
  NotSubmitted,
  HasError,
  Success,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  state: States = States.NotSubmitted;
  states = States;
  isLoading$: Observable<boolean>;
  
  // Propiedades para los mensajes dinámicos
  successMessage: string = '';
  errorMessage: string = '';

  private unsubscribe: Subscription[] = [];
  
  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.isLoading$ = this.authService.isLoading$;
  }

  ngOnInit(): void {
    this.initForm();
  }

  get f() {
    return this.forgotPasswordForm.controls;
  }

  initForm() {
    this.forgotPasswordForm = this.fb.group({
      username: [
        '',
        Validators.compose([Validators.required, Validators.minLength(3)]),
      ],
    });
  }

  submit() {
    this.state = States.NotSubmitted;
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    const forgotPasswordSubscr = this.authService
      .forgotPassword(this.f.username.value)
      .pipe(first())
      .subscribe({
        // Se ejecuta si el backend devuelve una respuesta 2xx (ÉXITO)
        next: (response: any) => {
          this.successMessage = response.message || 'Solicitud procesada. Se ha enviado una notificación al administrador.';
          this.state = States.Success;
        },
        // Se ejecuta si el backend devuelve un error (4xx - Usuario no encontrado)
        error: (err) => {
          this.errorMessage = err.error?.error || 'Ocurrió un error inesperado. Inténtalo de nuevo.';
          this.state = States.HasError;
        }
      });
    this.unsubscribe.push(forgotPasswordSubscr);
  }
}