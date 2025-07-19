import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { ApoderadoService } from 'src/app/services/apoderado.service';
import { PageResponse } from 'src/app/models/page-response.model';

@Component({
  selector: 'app-apoderados',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './apoderados.component.html',
  styleUrls: ['./apoderados.component.scss']
})
export class ApoderadosComponent implements OnInit {
  @ViewChild('addApoderadoModal') addApoderadoModal: TemplateRef<any>;
  @ViewChild('editApoderadoModal') editApoderadoModal: TemplateRef<any>;

  // --- Enums para la Vista ---
  GeneroReference = GeneroReference;
  EstadoReference = EstadoReference;
  generoKeys = Object.values(GeneroReference) as string[];
  estadoKeys = Object.values(EstadoReference) as string[];

  // --- Modelos para los Modales ---
  newApoderado: Partial<ApoderadoDto> = {};
  editingApoderado: ApoderadoDto | null = null;

  // --- Propiedades para Paginación y Filtros ---
  pagedApoderados: PageResponse<ApoderadoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private apoderadoService: ApoderadoService // ÚNICA dependencia de servicio necesaria
  ) { }

  ngOnInit(): void {
    this.loadApoderados();
  }

  /**
   * Carga los apoderados desde la API aplicando los filtros y la paginación actual.
   */
  loadApoderados(): void {
    // La API pagina desde 0, la UI desde 1.
    const page = this.currentPage - 1;
    this.apoderadoService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroEstado)
      .subscribe(response => {
        this.pagedApoderados = response;
        this.cdr.detectChanges(); // Forzar detección de cambios si es necesario
      });
  }

  /**
   * Se llama cuando el usuario cambia el estado del filtro o busca algo.
   */
  onFilterChange(): void {
    this.currentPage = 1; // Volver a la primera página al filtrar
    this.loadApoderados();
  }

  /**
   * Limpia los filtros y recarga los datos.
   */
  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  /**
   * Cambia la página actual y recarga los datos.
   * @param page El número de página al que se quiere ir.
   */
  setPage(page: number): void {
    if (page < 1 || (this.pagedApoderados && page > this.pagedApoderados.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadApoderados();
  }

  /**
   * Genera un array de números para los botones de paginación.
   */
  getPagesArray(): number[] {
    if (!this.pagedApoderados) return [];
    return Array(this.pagedApoderados.totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- Métodos CRUD ---

  openAddApoderadoModal(): void {
    this.newApoderado = {
      genero: GeneroReference.MASCULINO,
      estado: EstadoReference.ACTIVO,
    };
    this.modalService.open(this.addApoderadoModal, { centered: true, size: 'lg' });
  }

  saveApoderado(): void {
    // Realiza aquí las validaciones que necesites
    if (!this.newApoderado.dni || !this.newApoderado.nombre || !this.newApoderado.apellidoPaterno) {
      Swal.fire('Error', 'Los campos DNI, Nombre y Apellido Paterno son requeridos.', 'error');
      return;
    }

    this.apoderadoService.add(this.newApoderado).subscribe(apoderadoAgregado => {
      if (apoderadoAgregado) {
        Swal.fire('¡Éxito!', 'Apoderado añadido correctamente.', 'success');
        this.loadApoderados(); // Recargar datos
        this.dismiss(); // Cierra el modal
      } else {
        Swal.fire('Error', 'No se pudo agregar el apoderado.', 'error');
      }
    });
  }

  openEditApoderadoModal(apoderado: ApoderadoDto): void {
    this.editingApoderado = { ...apoderado }; // Clonar el objeto para no modificar el original
    this.modalService.open(this.editApoderadoModal, { centered: true, size: 'lg' });
  }

  updateApoderado(): void {
    if (!this.editingApoderado || !this.editingApoderado.identifier) return;

    this.apoderadoService.update(this.editingApoderado.identifier, this.editingApoderado).subscribe(apoderadoActualizado => {
      if (apoderadoActualizado) {
        Swal.fire('¡Éxito!', 'Apoderado actualizado correctamente.', 'success');
        this.loadApoderados(); // Recargar datos
        this.dismiss(); // Cierra el modal
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el apoderado.', 'error');
      }
    });
  }

  confirmDeleteApoderado(apoderado: ApoderadoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás al apoderado: ${apoderado.nombre} ${apoderado.apellidoPaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && apoderado.identifier) {
        this.deleteApoderado(apoderado.identifier);
      }
    });
  }

  private deleteApoderado(identifier: string): void {
    this.apoderadoService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El apoderado ha sido eliminado.', 'success');
        // Lógica para ajustar la página si se elimina el último registro de ella
        if (this.pagedApoderados?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadApoderados(); // Recargar datos
      } else {
        Swal.fire('Error', 'No se pudo eliminar el apoderado.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}