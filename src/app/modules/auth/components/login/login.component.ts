import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hasError: boolean;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;
    // Redirigir si ya hay una sesión activa
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      usuario: [
        '', // Dejar el valor por defecto vacío es una buena práctica
        Validators.compose([
          Validators.required,
        ]),
      ],
      contraseña: [
        '',
        Validators.compose([Validators.required]),
      ],
    });
  }

  submit() {
    this.hasError = false;
    if (this.loginForm.invalid) {
      return;
    }

    const credentials: LoginRequest = {
      usuario: this.f.usuario.value,
      contraseña: this.f.contraseña.value,
    };

    this.authService
      .login(credentials)
      .pipe(first())
      .subscribe((user) => {
        if (user) {
          this.router.navigate([this.returnUrl]);
        } else {
          // El servicio ya maneja el error, aquí solo actualizamos la UI
          this.hasError = true;
        }
      });
  }
}
