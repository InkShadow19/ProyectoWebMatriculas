import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { RolDto } from 'src/app/models/rol.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { RolService } from 'src/app/services/rol.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule, SharedModule, FormsModule, ReactiveFormsModule, NgbDropdownModule,
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  @ViewChild('rolModal') rolModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  
  rolForm: FormGroup;
  isEditing = false;

  pagedRoles: PageResponse<RolDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private rolService: RolService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoKeys = Object.values(EstadoReference).filter(e => e !== EstadoReference.UNDEFINED);
    this.rolForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadRoles();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
    }
  }

  initForm(): FormGroup {
    return this.fb.group({
      identifier: [null],
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)
      ]],
      estado: [EstadoReference.ACTIVO, Validators.required],
    });
  }

  loadRoles(): void {
    const page = this.currentPage - 1;
    this.rolService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroEstado)
      .subscribe(response => {
        this.pagedRoles = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadRoles();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedRoles && page > this.pagedRoles.totalPages)) return;
    this.currentPage = page;
    this.loadRoles();
  }

  getPagesArray(): number[] {
    if (!this.pagedRoles) return [];
    return Array(this.pagedRoles.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddRolModal(): void {
    this.isEditing = false;
    this.rolForm.reset({ estado: EstadoReference.ACTIVO });
    this.modalService.open(this.rolModal, { centered: true, size: 'lg' });
  }

  openEditRolModal(rol: RolDto): void {
    this.isEditing = true;
    this.rolForm.patchValue(rol);
    this.modalService.open(this.rolModal, { centered: true, size: 'lg' });
  }

  saveRol(): void {
    if (this.rolForm.invalid) {
      this.rolForm.markAllAsTouched();
      return;
    }

    const formValue = this.rolForm.value;
    const request = this.isEditing 
      ? this.rolService.update(formValue.identifier, formValue)
      : this.rolService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Rol actualizado' : 'Rol añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadRoles();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteRol(rol: RolDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el rol: ${rol.descripcion}. ¡Esta acción no se puede deshacer!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && rol.identifier) {
        this.deleteRol(rol.identifier);
      }
    });
  }

  private deleteRol(identifier: string): void {
    this.rolService.delete(identifier).subscribe({
      next: () => {
        Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
        this.loadRoles();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'No se pudo eliminar el rol.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}