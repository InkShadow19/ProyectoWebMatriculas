import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { GradoService } from 'src/app/services/grado.service';
import { NivelService } from 'src/app/services/nivel.service';
import { NivelDto } from 'src/app/models/nivel.model';
import { PageResponse } from 'src/app/models/page-response.model';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './grados.component.html',
  styleUrls: ['./grados.component.scss'],
})
export class GradosComponent implements OnInit {
  @ViewChild('addGradoModal') addGradoModal: TemplateRef<any>;
  @ViewChild('editGradoModal') editGradoModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  nivelesDisponibles: NivelDto[] = [];

  pagedGrados: PageResponse<GradoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  filtroNivel: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  newGrado: Partial<GradoDto> = {};
  editingGrado: GradoDto | null = null;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private gradoService: GradoService,
    private nivelService: NivelService
  ) {
    this.estadoKeys = Object.values(EstadoReference);
  }

  ngOnInit(): void {
    this.loadNiveles();
  }

  loadNiveles(): void {
    this.nivelService.getList(0, 100).subscribe(response => {
      this.nivelesDisponibles = response?.content || [];
      this.loadGrados();
    });
  }

  loadGrados(): void {
    const page = this.currentPage - 1;
    this.gradoService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroEstado, this.filtroNivel)
      .subscribe(response => {
        this.pagedGrados = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadGrados();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.filtroNivel = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedGrados && page > this.pagedGrados.totalPages)) return;
    this.currentPage = page;
    this.loadGrados();
  }

  getPagesArray(): number[] {
    if (!this.pagedGrados) return [];
    return Array(this.pagedGrados.totalPages).fill(0).map((x, i) => i + 1);
  }

  getNivelDescripcion(nivelIdentifier: string): string {
    const nivel = this.nivelesDisponibles.find(n => n.identifier === nivelIdentifier);
    return nivel ? nivel.descripcion : 'N/A';
  }

  // --- Métodos CRUD ---
  openAddGradoModal(): void {
    this.newGrado = {
      descripcion: '',
      nivel: '',
      estado: EstadoReference.ACTIVO,
    };
    this.modalService.open(this.addGradoModal, { centered: true, size: 'lg' });
  }

  saveGrado(): void {
    if (!this.newGrado.descripcion || !this.newGrado.nivel || !this.newGrado.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    this.gradoService.add(this.newGrado).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Grado añadido correctamente.', 'success');
        this.loadGrados();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el grado.', 'error');
      }
    });
  }

  openEditGradoModal(grado: GradoDto): void {
    this.editingGrado = { ...grado };
    this.modalService.open(this.editGradoModal, { centered: true, size: 'lg' });
  }

  updateGrado(): void {
    if (!this.editingGrado || !this.editingGrado.identifier) return;

    if (!this.editingGrado.descripcion || !this.editingGrado.nivel || !this.editingGrado.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    this.gradoService.update(this.editingGrado.identifier, this.editingGrado).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Grado actualizado correctamente.', 'success');
        this.loadGrados();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Grado no encontrado.', 'error');
      }
    });
  }

  confirmDeleteGrado(grado: GradoDto): void {
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
      if (result.isConfirmed && grado.identifier) {
        this.deleteGrado(grado.identifier);
      }
    });
  }

  private deleteGrado(identifier: string): void {
    this.gradoService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El grado ha sido eliminado.', 'success');
        if (this.pagedGrados?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadGrados();
      } else {
        Swal.fire('Error', 'No se pudo encontrar el grado para eliminar.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}