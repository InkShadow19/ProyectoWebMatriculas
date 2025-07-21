import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule,
  ],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent implements OnInit {
  @ViewChild('addRolModal') addRolModal: TemplateRef<any>;
  @ViewChild('editRolModal') editRolModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newRol: Partial<RolDto> = {};
  editingRol: RolDto | null = null;

  pagedRoles: PageResponse<RolDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private rolService: RolService,
    private authService: AuthService,
    private router: Router
  ) {
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

  // --- Métodos CRUD ---
  openAddRolModal(): void {
    this.newRol = {
      descripcion: '',
      estado: EstadoReference.ACTIVO,
    };
    this.modalService.open(this.addRolModal, { centered: true, size: 'lg' });
  }

  saveRol(): void {
    if (!this.newRol.descripcion || !this.newRol.estado) {
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios.', 'error');
      return;
    }

    this.rolService.add(this.newRol).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Rol añadido correctamente.', 'success');
        this.loadRoles();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el rol.', 'error');
      }
    });
  }

  openEditRolModal(rol: RolDto): void {
    this.editingRol = { ...rol };
    this.modalService.open(this.editRolModal, { centered: true, size: 'lg' });
  }

  updateRol(): void {
    if (!this.editingRol || !this.editingRol.identifier) return;

    if (!this.editingRol.descripcion || !this.editingRol.estado) {
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios para editar.', 'error');
      return;
    }

    this.rolService.update(this.editingRol.identifier, this.editingRol).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Rol actualizado correctamente.', 'success');
        this.loadRoles();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Rol no encontrado para actualizar.', 'error');
      }
    });
  }

  confirmDeleteRol(rol: RolDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el rol: ${rol.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && rol.identifier) {
        this.deleteRol(rol.identifier);
      }
    });
  }

  private deleteRol(identifier: string): void {
    this.rolService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
        if (this.pagedRoles?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadRoles();
      } else {
        Swal.fire('Error', 'No se pudo encontrar el rol para eliminar.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
} 