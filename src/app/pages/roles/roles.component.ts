import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { RolDto } from 'src/app/models/rol.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';

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

  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newRol: RolDto = {
    identifier: '',
    descripcion: '',
    estado: EstadoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    usuarios: [],
  };

  editingRol: RolDto | null = null;

  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allRoles: RolDto[] = [
    { identifier: '1', descripcion: 'Administrador', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-10T09:00:00Z', usuarios: [] },
    { identifier: '2', descripcion: 'Secretaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-11T10:30:00Z', usuarios: [] },
    { identifier: '3', descripcion: 'Profesor', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-12T11:00:00Z', usuarios: [] },
  ];
  filteredRoles: RolDto[] = [];
  pagedRoles: RolDto[] = [];

  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let rolesTemp = [...this.allRoles];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    // 1. Filtrar por estado
    if (this.filtroEstado) {
      rolesTemp = rolesTemp.filter(rol => rol.estado === this.filtroEstado);
    }

    // 2. Filtrar por búsqueda de texto
    if (searchTerm) {
      rolesTemp = rolesTemp.filter(rol =>
        rol.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredRoles = rolesTemp;
    this.setPage(1);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.aplicarFiltroYPaginar();
  }

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;

    if (this.filteredRoles.length === 0) {
      this.pagedRoles = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredRoles.length);
    this.pagedRoles = this.filteredRoles.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredRoles.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Rol ---
  openAddRolModal() {
    this.newRol = {
      identifier: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: new Date().toISOString(),
      usuarios: [],
    };
    this.modalService.open(this.addRolModal, { centered: true, size: 'lg' });
  }

  saveRol() {
    if (!this.newRol.descripcion || !this.newRol.estado) {
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios.', 'error');
      return;
    }

    const maxId = Math.max(...this.allRoles.map(r => parseInt(r.identifier || '0')), 0);
    this.newRol.identifier = (maxId + 1).toString();
    this.allRoles.push({ ...this.newRol });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Rol añadido correctamente.', 'success');
    this.dismiss();
  }

  // --- Métodos para Editar Rol ---
  openEditRolModal(rol: RolDto) {
    this.editingRol = { ...rol };
    this.modalService.open(this.editRolModal, { centered: true, size: 'lg' });
  }

  updateRol() {
    if (!this.editingRol) { return; }
    if (!this.editingRol.descripcion || !this.editingRol.estado) {
      Swal.fire('Error', 'La descripción y el estado del rol son obligatorios para editar.', 'error');
      return;
    }

    const index = this.allRoles.findIndex(r => r.identifier === this.editingRol?.identifier);
    if (index !== -1) {
      this.allRoles[index] = { ...this.editingRol };
      this.aplicarFiltroYPaginar();
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
    const initialLength = this.allRoles.length;
    this.allRoles = this.allRoles.filter(rol => rol.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allRoles.length < initialLength) {
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