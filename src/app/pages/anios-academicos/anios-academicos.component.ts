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

  currentPage = 1;
  itemsPerPage = 5;
  pagedAniosAcademicos: AnioAcademicoDto[] = [];

  newAnioAcademico: AnioAcademicoDto = {
    identifier: '',
    anio: new Date().getFullYear(),
    estado: EstadoAcademicoReference.FUTURO,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };

  editingAnioAcademico: AnioAcademicoDto | null = null;

  aniosAcademicos: AnioAcademicoDto[] = [
    { identifier: '1', anio: 2023, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2023-01-15T09:00:00Z', matriculas: [] },
    { identifier: '2', anio: 2024, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2024-01-15T09:00:00Z', matriculas: [] },
    { identifier: '3', anio: 2025, estado: EstadoAcademicoReference.ACTIVO, fechaCreacion: '2025-01-15T09:00:00Z', matriculas: [] },
    { identifier: '4', anio: 2026, estado: EstadoAcademicoReference.FUTURO, fechaCreacion: '2025-07-01T11:00:00Z', matriculas: [] },
    { identifier: '5', anio: 2022, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2022-01-15T09:00:00Z', matriculas: [] },
    { identifier: '6', anio: 2021, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2021-01-15T09:00:00Z', matriculas: [] },
    { identifier: '7', anio: 2020, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2020-01-15T09:00:00Z', matriculas: [] },
    { identifier: '8', anio: 2019, estado: EstadoAcademicoReference.CERRADO, fechaCreacion: '2019-01-15T09:00:00Z', matriculas: [] },
  ];

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoAcademicoKeys = Object.values(EstadoAcademicoReference) as string[];
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
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.aniosAcademicos.length);
    this.pagedAniosAcademicos = this.aniosAcademicos.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.aniosAcademicos.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Año Académico ---

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

    const maxId = Math.max(...this.aniosAcademicos.map(a => parseInt(a.identifier || '0')), 0);
    this.newAnioAcademico.identifier = (maxId + 1).toString();

    this.aniosAcademicos.push({ ...this.newAnioAcademico });

    this.setPage(this.getTotalPages());
    this.cdr.detectChanges();

    Swal.fire('¡Éxito!', 'Año académico añadido correctamente.', 'success');
    console.log('Nuevo año académico guardado:', this.newAnioAcademico);
    this.dismiss();
  }

  // --- Métodos para Editar Año Académico ---

  openEditAnioAcademicoModal(anio: AnioAcademicoDto) {
    this.editingAnioAcademico = { ...anio };
    this.modalService.open(this.editAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  updateAnioAcademico() {
    if (!this.editingAnioAcademico) {
      Swal.fire('Error', 'No hay año académico seleccionado para editar.', 'error');
      return;
    }
    if (!this.editingAnioAcademico.anio || !this.editingAnioAcademico.estado) {
      Swal.fire('Error', 'Año y estado son campos obligatorios para editar.', 'error');
      return;
    }
    if (this.editingAnioAcademico.anio < 1900 || this.editingAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    const index = this.aniosAcademicos.findIndex(a => a.identifier === this.editingAnioAcademico?.identifier);
    if (index !== -1) {
      this.aniosAcademicos[index] = { ...this.editingAnioAcademico };
      this.setPage(this.currentPage);
      this.cdr.detectChanges();
      Swal.fire('¡Éxito!', 'Año académico actualizado correctamente.', 'success');
      console.log('Año académico actualizado:', this.editingAnioAcademico);
    } else {
      Swal.fire('Error', 'Año académico no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  // --- Métodos para Eliminar Año Académico ---

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
    const initialLength = this.aniosAcademicos.length;
    this.aniosAcademicos = this.aniosAcademicos.filter(a => a.identifier !== identifier);

    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else if (totalPages === 0) {
      this.pagedAniosAcademicos = [];
    }
    else {
      this.setPage(this.currentPage);
    }

    this.cdr.detectChanges();

    if (this.aniosAcademicos.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El año académico ha sido eliminado.', 'success');
      console.log(`Año académico con ID ${identifier} eliminado.`);
    } else {
      Swal.fire('Error', 'No se pudo encontrar el año académico para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---

  dismiss() {
    this.modalService.dismissAll();
  }
}