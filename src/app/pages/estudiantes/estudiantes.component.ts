import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { PageResponse } from 'src/app/models/page-response.model';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss'
})
export class EstudiantesComponent implements OnInit {
  @ViewChild('addEstudianteModal') addEstudianteModal: TemplateRef<any>;
  @ViewChild('editEstudianteModal') editEstudianteModal: TemplateRef<any>;

  GeneroReference = GeneroReference;
  EstadoAcademicoReference = EstadoAcademicoReference;
  generoKeys = Object.values(GeneroReference);
  estadoAcademicoKeys: EstadoAcademicoReference[] = [
    EstadoAcademicoReference.ACTIVO,
    EstadoAcademicoReference.RETIRADO,
    EstadoAcademicoReference.EGRESADO,
  ];

  newEstudiante: Partial<EstudianteDto> = {};
  editingEstudiante: EstudianteDto | null = null;

  pagedEstudiantes: PageResponse<EstudianteDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: EstadoAcademicoReference | '' = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private estudianteService: EstudianteService
  ) {}

  ngOnInit(): void {
    this.loadEstudiantes();
  }

  loadEstudiantes(): void {
    const page = this.currentPage - 1;
    const estado = this.filtroEstado === '' ? undefined : this.filtroEstado;
    this.estudianteService.getList(page, this.itemsPerPage, this.filtroBusqueda, estado)
      .subscribe(response => {
        this.pagedEstudiantes = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadEstudiantes();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedEstudiantes && page > this.pagedEstudiantes.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadEstudiantes();
  }

  getPagesArray(): number[] {
    if (!this.pagedEstudiantes) return [];
    return Array(this.pagedEstudiantes.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddEstudianteModal(): void {
    this.newEstudiante = {
      genero: GeneroReference.MASCULINO,
      estadoAcademico: EstadoAcademicoReference.ACTIVO,
    };
    this.modalService.open(this.addEstudianteModal, { centered: true, size: 'lg' });
  }

  saveEstudiante(): void {
    if (!this.newEstudiante.dni || !this.newEstudiante.nombre || !this.newEstudiante.apellidoPaterno) {
      Swal.fire('Error', 'Los campos DNI, Nombre y Apellido Paterno son requeridos.', 'error');
      return;
    }

    this.estudianteService.add(this.newEstudiante).subscribe(estudianteAgregado => {
      if (estudianteAgregado) {
        Swal.fire('¡Éxito!', 'Estudiante añadido correctamente.', 'success');
        this.loadEstudiantes();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el estudiante.', 'error');
      }
    });
  }

  openEditEstudianteModal(estudiante: EstudianteDto): void {
    this.editingEstudiante = { ...estudiante };
    this.modalService.open(this.editEstudianteModal, { centered: true, size: 'lg' });
  }

  updateEstudiante(): void {
    if (!this.editingEstudiante || !this.editingEstudiante.identifier) return;

    this.estudianteService.update(this.editingEstudiante.identifier, this.editingEstudiante).subscribe(estudianteActualizado => {
      if (estudianteActualizado) {
        Swal.fire('¡Éxito!', 'Estudiante actualizado correctamente.', 'success');
        this.loadEstudiantes();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el estudiante.', 'error');
      }
    });
  }

  confirmDeleteEstudiante(estudiante: EstudianteDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás a ${estudiante.nombre} ${estudiante.apellidoPaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && estudiante.identifier) {
        this.deleteEstudiante(estudiante.identifier);
      }
    });
  }

  private deleteEstudiante(identifier: string): void {
    this.estudianteService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El estudiante ha sido eliminado.', 'success');
        if (this.pagedEstudiantes?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadEstudiantes();
      } else {
        Swal.fire('Error', 'No se pudo eliminar el estudiante.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}