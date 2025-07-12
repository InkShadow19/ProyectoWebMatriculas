import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-anios-academicos',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule,
  ],
  templateUrl: './anios-academicos.component.html',
  styleUrl: './anios-academicos.component.scss'
})
export class AniosAcademicosComponent implements OnInit {

  EstadoAcademicoReference = EstadoAcademicoReference;
  estadoAcademicoKeys: string[];

  @ViewChild('addAnioAcademicoModal') addAnioAcademicoModal: TemplateRef<any>;
  @ViewChild('editAnioAcademicoModal') editAnioAcademicoModal: TemplateRef<any>;

  newAnioAcademico: AnioAcademicoDto = {
    identifier: '',
    anio: new Date().getFullYear(),
    estado: EstadoAcademicoReference.FUTURO,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };
  editingAnioAcademico: AnioAcademicoDto | null = null;

  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allAniosAcademicos: AnioAcademicoDto[] = [
    { identifier: '1', anio: 2023, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2023-01-15T09:00:00Z', matriculas: [] },
    { identifier: '2', anio: 2024, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2024-01-15T09:00:00Z', matriculas: [] },
    { identifier: '3', anio: 2025, estado: EstadoAcademicoReference.ACTIVO, fechaCreacion: '2025-01-15T09:00:00Z', matriculas: [] },
    { identifier: '4', anio: 2026, estado: EstadoAcademicoReference.FUTURO, fechaCreacion: '2025-07-01T11:00:00Z', matriculas: [] },
    { identifier: '5', anio: 2022, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2022-01-15T09:00:00Z', matriculas: [] },
    { identifier: '6', anio: 2021, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2021-01-15T09:00:00Z', matriculas: [] },
    { identifier: '7', anio: 2020, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2020-01-15T09:00:00Z', matriculas: [] },
    { identifier: '8', anio: 2019, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2019-01-15T09:00:00Z', matriculas: [] },
  ];
  filteredAniosAcademicos: AnioAcademicoDto[] = [];
  pagedAniosAcademicos: AnioAcademicoDto[] = [];

  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    // Definimos solo los estados que queremos para este módulo
    this.estadoAcademicoKeys = [
      EstadoAcademicoReference.ACTIVO,
      EstadoAcademicoReference.CERRADO,
      EstadoAcademicoReference.FUTURO,
    ];
  }

  ngOnInit(): void {
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let aniosTemp = [...this.allAniosAcademicos];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    if (this.filtroEstado) {
      aniosTemp = aniosTemp.filter(anio => anio.estado === this.filtroEstado);
    }

    if (searchTerm) {
      aniosTemp = aniosTemp.filter(anio =>
        anio.anio.toString().includes(searchTerm)
      );
    }

    this.filteredAniosAcademicos = aniosTemp;
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

    if (this.filteredAniosAcademicos.length === 0) {
      this.pagedAniosAcademicos = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredAniosAcademicos.length);
    this.pagedAniosAcademicos = this.filteredAniosAcademicos.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredAniosAcademicos.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos CRUD ---
  openAddAnioAcademicoModal() {
    this.newAnioAcademico = {
      identifier: '',
      anio: new Date().getFullYear(),
      estado: EstadoAcademicoReference.FUTURO,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  saveAnioAcademico() {
    if (!this.newAnioAcademico.anio || !this.newAnioAcademico.estado) {
      Swal.fire('Error', 'Año y estado son campos obligatorios.', 'error');
      return;
    }
    if (this.newAnioAcademico.anio < 1900 || this.newAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    const maxId = Math.max(...this.allAniosAcademicos.map(a => parseInt(a.identifier || '0')), 0);
    this.newAnioAcademico.identifier = (maxId + 1).toString();
    this.allAniosAcademicos.push({ ...this.newAnioAcademico });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Año académico añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditAnioAcademicoModal(anio: AnioAcademicoDto) {
    this.editingAnioAcademico = { ...anio };
    this.modalService.open(this.editAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  updateAnioAcademico() {
    if (!this.editingAnioAcademico) { return; }
    if (!this.editingAnioAcademico.anio || !this.editingAnioAcademico.estado) {
      Swal.fire('Error', 'Año y estado son campos obligatorios para editar.', 'error');
      return;
    }
    if (this.editingAnioAcademico.anio < 1900 || this.editingAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    const index = this.allAniosAcademicos.findIndex(a => a.identifier === this.editingAnioAcademico?.identifier);
    if (index !== -1) {
      this.allAniosAcademicos[index] = { ...this.editingAnioAcademico };
      this.aplicarFiltroYPaginar();
      Swal.fire('¡Éxito!', 'Año académico actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Año académico no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteAnioAcademico(anio: AnioAcademicoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el año académico: ${anio.anio}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAnioAcademico(anio.identifier || '');
      }
    });
  }

  deleteAnioAcademico(identifier: string) {
    const initialLength = this.allAniosAcademicos.length;
    this.allAniosAcademicos = this.allAniosAcademicos.filter(a => a.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allAniosAcademicos.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El año académico ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el año académico para eliminar.', 'error');
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}