import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.scss',
})
export class GradosComponent implements OnInit {
  @ViewChild('addGradoModal') addGradoModal: TemplateRef<any>;
  @ViewChild('editGradoModal') editGradoModal: TemplateRef<any>;

  // Propiedades para manejar el estado
  EstadoReference = EstadoReference;
  estadoKeys: string[];

  currentPage = 1;
  itemsPerPage = 5;
  pagedGrados: GradoDto[] = [];

  grados: GradoDto[] = [
    { identifier: '1', descripcion: '3 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '2', descripcion: '4 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '3', descripcion: '5 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '4', descripcion: '1er Grado', nivel: 'Primaria', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '5', descripcion: '2do Grado', nivel: 'Primaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
  ];

  newGrado: GradoDto = { identifier: '', descripcion: '', nivel: '', estado: EstadoReference.ACTIVO, fechaCreacion: '', matriculas: [] };
  editingGrado: GradoDto | null = null;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[]; // <--- AÑADIDO
  }

  ngOnInit(): void {
    this.setPage(1);
  }

  // --- Métodos de Paginación ---
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.grados.length);
    this.pagedGrados = this.grados.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.grados.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos del CRUD ---
  openAddGradoModal() {
    this.newGrado = {
      identifier: '',
      descripcion: '',
      nivel: '',
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addGradoModal, { centered: true, size: 'lg' });
  }

  openEditGradoModal(grado: GradoDto) {
    this.editingGrado = { ...grado };
    this.modalService.open(this.editGradoModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveGrado() {
    if (!this.newGrado.descripcion || !this.newGrado.nivel || !this.newGrado.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    const maxId = Math.max(...this.grados.map(g => parseInt(g.identifier || '0')), 0);
    this.newGrado.identifier = (maxId + 1).toString();
    this.grados.push({ ...this.newGrado });
    this.setPage(this.getTotalPages());
    this.cdr.detectChanges();
    Swal.fire('¡Éxito!', 'Grado añadido correctamente.', 'success');
    this.dismiss();
  }

  updateGrado() {
    if (!this.editingGrado || !this.editingGrado.descripcion || !this.editingGrado.nivel || !this.editingGrado.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    const index = this.grados.findIndex(g => g.identifier === this.editingGrado!.identifier);
    if (index !== -1) {
      this.grados[index] = { ...this.editingGrado! };
      this.setPage(this.currentPage);
      this.cdr.detectChanges();
      Swal.fire('¡Éxito!', 'Grado actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Grado no encontrado.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteGrado(grado: GradoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el grado: ${grado.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGrado(grado.identifier || '');
      }
    });
  }

  deleteGrado(identifier: string) {
    const initialLength = this.grados.length;
    this.grados = this.grados.filter(grado => grado.identifier !== identifier);
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else if (totalPages === 0) {
      this.pagedGrados = [];
    } else {
      this.setPage(this.currentPage);
    }
    this.cdr.detectChanges();
    if (this.grados.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El grado ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el grado para eliminar.', 'error');
    }
  }
}