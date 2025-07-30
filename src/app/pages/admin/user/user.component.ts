import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { UsuarioDto } from 'src/app/models/usuario.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { RolDto } from 'src/app/models/rol.model';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { UsuarioService } from 'src/app/services/usuario.service';
import { RolService } from 'src/app/services/rol.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

export function fechaNacimientoValidator(control: AbstractControl): ValidationErrors | null {
  const fechaSeleccionada = new Date(control.value);
  const fechaActual = new Date();

  // 1. Validar que no sea una fecha futura
  if (fechaSeleccionada > fechaActual) {
    return { fechaFutura: true };
  }

  // 2. Validar que sea mayor de 18 años
  const fechaMayorDeEdad = new Date();
  fechaMayorDeEdad.setFullYear(fechaMayorDeEdad.getFullYear() - 18);

  if (fechaSeleccionada > fechaMayorDeEdad) {
    return { menorDeEdad: true };
  }

  return null; // Si pasa ambas validaciones, es válido
}

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  @ViewChild('userModal') userModal: TemplateRef<any>;

  // MODIFICADO: Se unifican los modales y se añade la propiedad del formulario
  isEditing = false;
  usuarioForm: FormGroup;

  EstadoReference = EstadoReference;
  GeneroReference = GeneroReference;
  generoKeys: string[];
  estadoKeys: string[];
  rolesDisponibles: RolDto[] = [];

  pagedUsuarios: PageResponse<UsuarioDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  // Propiedades para la contraseña
  password = '';
  confirmPassword = '';
  showResetPasswordFields = false;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder // MODIFICADO: Inyectar FormBuilder
  ) {
    this.generoKeys = Object.values(GeneroReference);
    this.estadoKeys = Object.values(EstadoReference);
    this.buildForm(); // Se llama al método que construye el formulario
  }

  ngOnInit(): void {
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
    this.loadRoles();
  }

  private buildForm(): void {
    this.usuarioForm = this.fb.group({
      identifier: [null],
      usuario: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20), Validators.pattern('^[a-zA-Z0-9-]+$')]],
      nombres: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      apellidos: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
      dni: ['', [Validators.required, Validators.pattern('\\d{8}')]],
      fechaNacimiento: ['', [Validators.required, fechaNacimientoValidator]],
      genero: [GeneroReference.MASCULINO, [Validators.required]],
      rol: ['', [Validators.required]],
      estado: [EstadoReference.ACTIVO, [Validators.required]],
    });
  }

  loadRoles(): void {
    this.rolService.getList(0, 100, undefined, EstadoReference.ACTIVO).subscribe(response => {
      this.rolesDisponibles = response?.content || [];
      this.loadUsuarios();
    });
  }

  loadUsuarios(): void {
    const page = this.currentPage - 1;
    this.usuarioService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroEstado)
      .subscribe(response => {
        this.pagedUsuarios = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadUsuarios();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedUsuarios && page > this.pagedUsuarios.totalPages)) return;
    this.currentPage = page;
    this.loadUsuarios();
  }

  getPagesArray(): number[] {
    if (!this.pagedUsuarios) return [];
    return Array(this.pagedUsuarios.totalPages).fill(0).map((x, i) => i + 1);
  }

  getRolDescripcion(rolIdentifier: string): string {
    const rol = this.rolesDisponibles.find(r => r.identifier === rolIdentifier);
    return rol ? rol.descripcion : 'Inactivo';
  }

  // --- Métodos CRUD ---
  openAddUserModal(): void {
    this.isEditing = false;
    this.usuarioForm.reset({
      genero: GeneroReference.MASCULINO,
      rol: '',
      estado: EstadoReference.ACTIVO
    });
    this.password = '';
    this.confirmPassword = '';
    this.modalService.open(this.userModal, { centered: true, size: 'lg' });
  }

  saveUser(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const usuarioData = this.usuarioForm.getRawValue();

    if (this.isEditing) {
      this.usuarioService.update(usuarioData.identifier, usuarioData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
          this.loadUsuarios();
          this.dismiss();
        },
        error: (err) => {
          Swal.fire('Error', err.error.error || 'No se pudo actualizar el usuario.', 'error');
        }
      });
    } else {
      if (this.password !== this.confirmPassword || !this.password) {
        Swal.fire('Error', 'Las contraseñas no coinciden o están vacías.', 'error');
        return;
      }
      usuarioData.contrasena = this.password;

      this.usuarioService.add(usuarioData).subscribe({
        next: () => {
          Swal.fire('¡Éxito!', 'Usuario añadido correctamente.', 'success');
          this.loadUsuarios();
          this.dismiss();
        },
        error: (err) => {
          Swal.fire('Error', err.error.error || 'No se pudo agregar el usuario.', 'error');
        }
      });
    }
  }

  openEditUserModal(usuario: UsuarioDto): void {
    this.isEditing = true;
    this.showResetPasswordFields = false; // Ocultar campos de contraseña al abrir
    this.password = '';
    this.confirmPassword = '';

    const fechaFormateada = usuario.fechaNacimiento 
      ? new Date(usuario.fechaNacimiento).toISOString().split('T')[0] 
      : null;

    this.usuarioForm.patchValue({
        ...usuario,
        fechaNacimiento: fechaFormateada // Se usa la fecha formateada y segura
    });

    this.modalService.open(this.userModal, { centered: true, size: 'lg' });
  }

  /*
  updateUser(): void {
    if (!this.editingUser || !this.editingUser.identifier) return;

    if (!this.editingUser.usuario || !this.editingUser.nombres || !this.editingUser.apellidos ||
      !this.editingUser.dni || !this.editingUser.fechaNacimiento || !this.editingUser.rol) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser completados.', 'error');
      return;
    }

    this.usuarioService.update(this.editingUser.identifier, this.editingUser).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
        this.loadUsuarios();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Usuario no encontrado para actualizar.', 'error');
      }
    });
  }*/

  confirmDeleteUser(usuario: UsuarioDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás al usuario: ${usuario.nombres} ${usuario.apellidos}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && usuario.identifier) {
        this.deleteUser(usuario.identifier);
      }
    });
  }

  private deleteUser(identifier: string): void {
    this.usuarioService.delete(identifier).subscribe(() => {
      Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
      if (this.pagedUsuarios?.content.length === 1 && this.currentPage > 1) {
        this.currentPage--;
      }
      this.loadUsuarios();
    }, () => {
      Swal.fire('Error', 'No se pudo encontrar el usuario para eliminar.', 'error');
    });
  }

  toggleResetPasswordFields(): void {
    this.showResetPasswordFields = !this.showResetPasswordFields;
  }

  submitNewPassword(): void {
    const identifier = this.usuarioForm.get('identifier')?.value;
    if (!identifier) return;

    if (!this.password || this.password.trim() === '') {
      Swal.fire('Error', 'La nueva contraseña no puede estar vacía.', 'error');
      return;
    }
    if (this.password !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.usuarioService.resetPassword(identifier, this.password).subscribe(() => {
      Swal.fire('¡Éxito!', 'La contraseña ha sido restablecida correctamente.', 'success');
      this.showResetPasswordFields = false;
      this.password = '';
      this.confirmPassword = '';
    }, () => {
      Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}