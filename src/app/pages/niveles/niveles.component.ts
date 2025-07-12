import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './niveles.component.html',
  styleUrl: './niveles.component.scss',
})
export class NivelesComponent implements OnInit {
  @ViewChild('addNivelModal') addNivelModal: TemplateRef<any>;
  @ViewChild('editNivelModal') editNivelModal: TemplateRef<any>;

  // Propiedades para manejar el estado
  EstadoReference = EstadoReference;
  estadoKeys: string[];

  currentPage = 1;
  itemsPerPage = 5;
  pagedNiveles: NivelDto[] = [];

  niveles: NivelDto[] = [
    { identifier: '1', descripcion: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '2', descripcion: 'Primaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '3', descripcion: 'Secundaria', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
  ];

  newNivel: NivelDto = { identifier: '', descripcion: '', estado: EstadoReference.ACTIVO, fechaCreacion: '', grados: [], matriculas: [] };
  editingNivel: NivelDto | null = null;

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
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.niveles.length);
    this.pagedNiveles = this.niveles.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.niveles.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos del CRUD ---
  openAddNivelModal() {
    this.newNivel = {
      identifier: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      grados: [],
      matriculas: [],
    };
    this.modalService.open(this.addNivelModal, { centered: true, size: 'lg' });
  }

  openEditNivelModal(nivel: NivelDto) {
    this.editingNivel = { ...nivel };
    this.modalService.open(this.editNivelModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveNivel() {
    if (!this.newNivel.descripcion || !this.newNivel.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }
    const maxId = Math.max(...this.niveles.map(n => parseInt(n.identifier || '0')), 0);
    this.newNivel.identifier = (maxId + 1).toString();
    this.niveles.push({ ...this.newNivel });
    this.setPage(this.getTotalPages());
    Swal.fire('¡Éxito!', 'Nivel añadido correctamente.', 'success');
    this.dismiss();
  }

  updateNivel() {
    if (!this.editingNivel || !this.editingNivel.descripcion || !this.editingNivel.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }
    const index = this.niveles.findIndex(n => n.identifier === this.editingNivel!.identifier);
    if (index !== -1) {
      this.niveles[index] = { ...this.editingNivel! };
      this.setPage(this.currentPage);
      Swal.fire('¡Éxito!', 'Nivel actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Nivel no encontrado.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteNivel(nivel: NivelDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el nivel: ${nivel.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteNivel(nivel.identifier || '');
      }
    });
  }

  deleteNivel(identifier: string) {
    const initialLength = this.niveles.length;
    this.niveles = this.niveles.filter(n => n.identifier !== identifier);
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else if (totalPages === 0) {
      this.pagedNiveles = [];
    }
    else {
      this.setPage(this.currentPage);
    }
    this.cdr.detectChanges();
    if (this.niveles.length < initialLength) {
      Swal.fire('¡Eliminado!','El nivel ha sido eliminado.','success');
    } else {
      Swal.fire('Error','No se pudo encontrar el nivel para eliminar.','error');
    }
  }
}