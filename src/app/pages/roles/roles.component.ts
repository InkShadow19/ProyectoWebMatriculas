import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { RolDto } from 'src/app/models/rol.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

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
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {

  @ViewChild('addRolModal') addRolModal: TemplateRef<any>;
  @ViewChild('editRolModal') editRolModal: TemplateRef<any>;

  // Propiedades para manejar el estado
  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newRol: RolDto = {
    identifier: '',
    descripcion: '',
    estado: EstadoReference.ACTIVO, // <--- CAMBIADO
    fechaCreacion: new Date().toISOString(),
    usuarios: [],
  };

  editingRol: RolDto | null = null;
  currentPage = 1;
  itemsPerPage = 5;
  pagedRoles: RolDto[] = [];

  roles: RolDto[] = [
    {
      identifier: '1',
      descripcion: 'Administrador',
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: '2024-01-10T09:00:00Z',
      usuarios: [],
    },
    {
      identifier: '2',
      descripcion: 'Secretaria',
      estado: EstadoReference.INACTIVO, // <--- CAMBIADO
      fechaCreacion: '2024-01-11T10:30:00Z',
      usuarios: [],
    }
  ];

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[]; // <--- AÑADIDO
  }

  ngOnInit(): void {
    this.setPage(1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos de Paginación ---
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.roles.length);
    this.pagedRoles = this.roles.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.roles.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Rol ---
  openAddRolModal() {
    this.newRol = {
      identifier: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      usuarios: [],
    };
    this.modalService.open(this.addRolModal, { centered: true, size: 'lg' });
  }

  saveRol() {
    if (!this.newRol.descripcion || !this.newRol.estado) { // <--- VALIDACIÓN AÑADIDA
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios.', 'error');
      return;
    }

    const maxId = Math.max(...this.roles.map(r => parseInt(r.identifier || '0')), 0);
    this.newRol.identifier = (maxId + 1).toString();
    this.roles.push({ ...this.newRol });
    this.setPage(this.getTotalPages());
    this.cdr.detectChanges();
    Swal.fire('¡Éxito!', 'Rol añadido correctamente.', 'success');
    this.dismiss();
  }

  // --- Métodos para Editar Rol ---
  openEditRolModal(rol: RolDto) {
    this.editingRol = { ...rol };
    this.modalService.open(this.editRolModal, { centered: true, size: 'lg' });
  }

  updateRol() {
    if (!this.editingRol) {
      Swal.fire('Error', 'No hay rol seleccionado para editar.', 'error');
      return;
    }
    if (!this.editingRol.descripcion || !this.editingRol.estado) { // <--- VALIDACIÓN AÑADIDA
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios para editar.', 'error');
      return;
    }

    const index = this.roles.findIndex(r => r.identifier === this.editingRol?.identifier);
    if (index !== -1) {
      this.roles[index] = { ...this.editingRol };
      this.setPage(this.currentPage);
      this.cdr.detectChanges();
      Swal.fire('¡Éxito!', 'Rol actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Rol no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  // --- Métodos para Eliminar Rol ---
  confirmDeleteRol(rol: RolDto) {
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
      if (result.isConfirmed) {
        this.deleteRol(rol.identifier || '');
      }
    });
  }

  deleteRol(identifier: string) {
    const initialLength = this.roles.length;
    this.roles = this.roles.filter(rol => rol.identifier !== identifier);
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else {
      this.setPage(this.currentPage);
    }
    this.cdr.detectChanges();
    if (this.roles.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el rol para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---
  dismiss() {
    this.modalService.dismissAll();
  }
}