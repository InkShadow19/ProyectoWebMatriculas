import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';

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

  EstadoReference = EstadoReference;
  estadoKeys: string[];

  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allNiveles: NivelDto[] = [
    { identifier: '1', descripcion: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '2', descripcion: 'Primaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '3', descripcion: 'Secundaria', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
  ];
  filteredNiveles: NivelDto[] = [];
  pagedNiveles: NivelDto[] = [];

  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  newNivel: NivelDto = { identifier: '', descripcion: '', estado: EstadoReference.ACTIVO, fechaCreacion: '', grados: [], matriculas: [] };
  editingNivel: NivelDto | null = null;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let nivelesTemp = [...this.allNiveles];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    if (this.filtroEstado) {
      nivelesTemp = nivelesTemp.filter(nivel => nivel.estado === this.filtroEstado);
    }

    if (searchTerm) {
      nivelesTemp = nivelesTemp.filter(nivel =>
        nivel.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredNiveles = nivelesTemp;
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

    if (this.filteredNiveles.length === 0) {
      this.pagedNiveles = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredNiveles.length);
    this.pagedNiveles = this.filteredNiveles.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredNiveles.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos del CRUD ---
  openAddNivelModal() {
    this.newNivel = {
      identifier: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: new Date().toISOString(),
      grados: [],
      matriculas: [],
    };
    this.modalService.open(this.addNivelModal, { centered: true, size: 'lg' });
  }

  saveNivel() {
    if (!this.newNivel.descripcion || !this.newNivel.estado) {
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }
    const maxId = Math.max(...this.allNiveles.map(n => parseInt(n.identifier || '0')), 0);
    this.newNivel.identifier = (maxId + 1).toString();
    this.allNiveles.push({ ...this.newNivel });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Nivel añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditNivelModal(nivel: NivelDto) {
    this.editingNivel = { ...nivel };
    this.modalService.open(this.editNivelModal, { centered: true, size: 'lg' });
  }

  updateNivel() {
    if (!this.editingNivel || !this.editingNivel.descripcion || !this.editingNivel.estado) {
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }
    const index = this.allNiveles.findIndex(n => n.identifier === this.editingNivel!.identifier);
    if (index !== -1) {
      this.allNiveles[index] = { ...this.editingNivel! };
      this.aplicarFiltroYPaginar();
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
    const initialLength = this.allNiveles.length;
    this.allNiveles = this.allNiveles.filter(n => n.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allNiveles.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El nivel ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el nivel para eliminar.', 'error');
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}