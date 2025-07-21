import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
})
export class UserComponent implements OnInit {
  @ViewChild('addUserModal') addUserModal: TemplateRef<any>;
  @ViewChild('editUserModal') editUserModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  GeneroReference = GeneroReference;
  generoKeys: string[];
  estadoKeys: string[];
  rolesDisponibles: RolDto[] = [];

  newUsuario: Partial<UsuarioDto> = {};
  confirmPassword = '';
  editingUser: UsuarioDto | null = null;
  
  pagedUsuarios: PageResponse<UsuarioDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  // Propiedades para el reset de contraseña
  showResetPasswordFields = false;
  newPassword = '';
  confirmNewPassword = '';

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private usuarioService: UsuarioService,
    private rolService: RolService,
    private authService: AuthService,
    private router: Router
  ) {
    this.generoKeys = Object.values(GeneroReference);
    this.estadoKeys = Object.values(EstadoReference);
  }

  ngOnInit(): void {
    this.loadRoles();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
  }

  loadRoles(): void {
    this.rolService.getList(0, 100).subscribe(response => {
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
    return rol ? rol.descripcion : 'N/A';
  }

  // --- Métodos CRUD ---
  openAddUserModal(): void {
    this.newUsuario = {
      genero: GeneroReference.MASCULINO,
      rol: this.rolesDisponibles.length > 0 ? this.rolesDisponibles[0].identifier : '',
      estado: EstadoReference.ACTIVO,
    };
    this.confirmPassword = ''; // Limpiar campo al abrir
    this.modalService.open(this.addUserModal, { centered: true, size: 'lg' });
  }

  saveUser(): void {
    if (!this.newUsuario.usuario || !this.newUsuario.nombres || !this.newUsuario.apellidos ||
      !this.newUsuario.dni || !this.newUsuario.fechaNacimiento ||
      !this.newUsuario.rol || !this.newUsuario.contrasena) {
      Swal.fire('Error', 'Todos los campos obligatorios, incluyendo la contraseña, deben ser completados.', 'error');
      return;
    }
    if (this.newUsuario.contrasena !== this.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.usuarioService.add(this.newUsuario).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Usuario añadido correctamente.', 'success');
        this.loadUsuarios();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el usuario.', 'error');
      }
    });
  }

  openEditUserModal(usuario: UsuarioDto): void {
    this.editingUser = { ...usuario };
    this.showResetPasswordFields = false;
    this.newPassword = '';
    this.confirmNewPassword = '';
    this.modalService.open(this.editUserModal, { centered: true, size: 'lg' });
  }

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
  }

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
    this.usuarioService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
        if (this.pagedUsuarios?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadUsuarios();
      } else {
        Swal.fire('Error', 'No se pudo encontrar el usuario para eliminar.', 'error');
      }
    });
  }

  toggleResetPasswordFields(): void {
    this.showResetPasswordFields = !this.showResetPasswordFields;
  }

  submitNewPassword(): void {
    if (!this.editingUser || !this.editingUser.identifier) return;

    if (!this.newPassword || this.newPassword.trim() === '') {
        Swal.fire('Error', 'La nueva contraseña no puede estar vacía.', 'error');
        return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden.', 'error');
      return;
    }

    this.usuarioService.resetPassword(this.editingUser.identifier, this.newPassword)
      .subscribe(success => {
        if (success) {
          Swal.fire('¡Éxito!', 'La contraseña ha sido restablecida correctamente.', 'success');
          this.showResetPasswordFields = false;
          this.newPassword = '';
          this.confirmNewPassword = '';
        } else {
          Swal.fire('Error', 'No se pudo restablecer la contraseña.', 'error');
        }
      });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}