import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AnioAcademicoService } from 'src/app/services/anio-academico.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

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
  styleUrls: ['./anios-academicos.component.scss']
})
export class AniosAcademicosComponent implements OnInit {
  @ViewChild('addAnioAcademicoModal') addAnioAcademicoModal: TemplateRef<any>;
  @ViewChild('editAnioAcademicoModal') editAnioAcademicoModal: TemplateRef<any>;

  EstadoAcademicoReference = EstadoAcademicoReference;
  estadoAcademicoKeys: string[];

  newAnioAcademico: Partial<AnioAcademicoDto> = {};
  editingAnioAcademico: AnioAcademicoDto | null = null;

  // --- Propiedades para Paginación y Filtros ---
  pagedAniosAcademicos: PageResponse<AnioAcademicoDto> | undefined;
  filtroBusqueda: number | null = null;
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private anioAcademicoService: AnioAcademicoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoAcademicoKeys = [
      EstadoAcademicoReference.ACTIVO,
      EstadoAcademicoReference.CERRADO,
      EstadoAcademicoReference.FUTURO,
    ];
  }

  ngOnInit(): void {
    this.loadAniosAcademicos();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
  }

  loadAniosAcademicos(): void {
    const page = this.currentPage - 1;
    this.anioAcademicoService.getList(page, this.itemsPerPage, this.filtroBusqueda ?? undefined, this.filtroEstado)
      .subscribe(response => {
        this.pagedAniosAcademicos = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadAniosAcademicos();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = null;
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedAniosAcademicos && page > this.pagedAniosAcademicos.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadAniosAcademicos();
  }

  getPagesArray(): number[] {
    if (!this.pagedAniosAcademicos) return [];
    return Array(this.pagedAniosAcademicos.totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- Métodos CRUD ---
  openAddAnioAcademicoModal(): void {
    this.newAnioAcademico = {
      anio: new Date().getFullYear(),
      estadoAcademico: EstadoAcademicoReference.FUTURO,
    };
    this.modalService.open(this.addAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  saveAnioAcademico(): void {
    if (!this.newAnioAcademico.anio || !this.newAnioAcademico.estadoAcademico) {
      Swal.fire('Error', 'Año y estado son campos obligatorios.', 'error');
      return;
    }
    if (this.newAnioAcademico.anio < 1900 || this.newAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    this.anioAcademicoService.add(this.newAnioAcademico).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Año académico añadido correctamente.', 'success');
        this.loadAniosAcademicos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el año académico.', 'error');
      }
    });
  }

  openEditAnioAcademicoModal(anio: AnioAcademicoDto): void {
    this.editingAnioAcademico = { ...anio };
    this.modalService.open(this.editAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  updateAnioAcademico(): void {
    if (!this.editingAnioAcademico || !this.editingAnioAcademico.identifier) return;

    if (!this.editingAnioAcademico.anio || !this.editingAnioAcademico.estadoAcademico) {
      Swal.fire('Error', 'Año y estado son campos obligatorios para editar.', 'error');
      return;
    }
    if (this.editingAnioAcademico.anio < 1900 || this.editingAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    this.anioAcademicoService.update(this.editingAnioAcademico.identifier, this.editingAnioAcademico).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Año académico actualizado correctamente.', 'success');
        this.loadAniosAcademicos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el año académico.', 'error');
      }
    });
  }

  confirmDeleteAnioAcademico(anio: AnioAcademicoDto): void {
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
      if (result.isConfirmed && anio.identifier) {
        this.deleteAnioAcademico(anio.identifier);
      }
    });
  }

  private deleteAnioAcademico(identifier: string): void {
    this.anioAcademicoService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El año académico ha sido eliminado.', 'success');
        if (this.pagedAniosAcademicos?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadAniosAcademicos();
      } else {
        Swal.fire('Error', 'No se pudo eliminar el año académico.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}