import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthService, LoginRequest } from '../../services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  returnUrl: string;
  isLoading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.isLoading$ = this.authService.isLoading$;

    // Redirigir al dashboard si el usuario ya ha iniciado sesión
    if (this.authService.currentUserValue) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit(): void {
    this.initForm();
    // Obtener la URL de retorno desde los parámetros de la ruta, o por defecto ir al dashboard
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  // Getter para un acceso más fácil a los campos del formulario
  get f() {
    return this.loginForm.controls;
  }

  initForm() {
    this.loginForm = this.fb.group({
      usuario: [
        '', // Valor inicial vacío
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
        ]),
      ],
      contrasena: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
        ]),
      ],
    });
  }

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials: LoginRequest = {
      usuario: this.f.usuario.value,
      contrasena: this.f.contrasena.value,
    };

    this.authService
      .login(credentials)
      .pipe(first())
      .subscribe({
        next: (userInfo) => {
          if (userInfo) {
            // 1. PRIMERO NAVEGAMOS
            this.router.navigate([this.returnUrl]).then(() => {
              // 2. Y DESPUÉS DE NAVEGAR, MOSTRAMOS EL TOAST
              // Usamos setTimeout para darle al navegador un instante para renderizar
              setTimeout(() => {
                const Toast = Swal.mixin({
                  toast: true,
                  position: 'top-end',
                  showConfirmButton: false,
                  timer: 3000,
                  timerProgressBar: true,
                  didOpen: (toast) => {
                    toast.addEventListener('mouseenter', Swal.stopTimer);
                    toast.addEventListener('mouseleave', Swal.resumeTimer);
                  },
                });

                Toast.fire({
                  icon: 'success',
                  title: `¡Bienvenido, ${userInfo.username}!`,
                });
              }, 100); // 100 milisegundos es un retraso imperceptible para el usuario
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error de Autenticación',
            text: err.error?.message || err.error || 'Usuario o contraseña incorrectos.',
            confirmButtonColor: '#3085d6',
            heightAuto: false, // Mantenemos esto para el error
          });
        },
      });
  }
}