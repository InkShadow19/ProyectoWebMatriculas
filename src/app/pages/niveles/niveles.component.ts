import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { NivelService } from 'src/app/services/nivel.service';
import { PageResponse } from 'src/app/models/page-response.model';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './niveles.component.html',
  styleUrls: ['./niveles.component.scss'],
})
export class NivelesComponent implements OnInit {
  @ViewChild('addNivelModal') addNivelModal: TemplateRef<any>;
  @ViewChild('editNivelModal') editNivelModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];

  pagedNiveles: PageResponse<NivelDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  newNivel: Partial<NivelDto> = {};
  editingNivel: NivelDto | null = null;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private nivelService: NivelService
  ) {
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    this.loadNiveles();
  }

  loadNiveles(): void {
    const page = this.currentPage - 1;
    this.nivelService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroEstado)
      .subscribe(response => {
        this.pagedNiveles = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadNiveles();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedNiveles && page > this.pagedNiveles.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadNiveles();
  }

  getPagesArray(): number[] {
    if (!this.pagedNiveles) return [];
    return Array(this.pagedNiveles.totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- Métodos del CRUD ---
  openAddNivelModal(): void {
    this.newNivel = {
      descripcion: '',
      estado: EstadoReference.ACTIVO,
    };
    this.modalService.open(this.addNivelModal, { centered: true, size: 'lg' });
  }

  saveNivel(): void {
    if (!this.newNivel.descripcion || !this.newNivel.estado) {
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }

    this.nivelService.add(this.newNivel).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Nivel añadido correctamente.', 'success');
        this.loadNiveles();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el nivel.', 'error');
      }
    });
  }

  openEditNivelModal(nivel: NivelDto): void {
    this.editingNivel = { ...nivel };
    this.modalService.open(this.editNivelModal, { centered: true, size: 'lg' });
  }

  updateNivel(): void {
    if (!this.editingNivel || !this.editingNivel.identifier) return;

    if (!this.editingNivel.descripcion || !this.editingNivel.estado) {
      Swal.fire('Error', 'La descripción y el estado son obligatorios.', 'error');
      return;
    }

    this.nivelService.update(this.editingNivel.identifier, this.editingNivel).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Nivel actualizado correctamente.', 'success');
        this.loadNiveles();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Nivel no encontrado.', 'error');
      }
    });
  }

  confirmDeleteNivel(nivel: NivelDto): void {
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
      if (result.isConfirmed && nivel.identifier) {
        this.deleteNivel(nivel.identifier);
      }
    });
  }

  private deleteNivel(identifier: string): void {
    this.nivelService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El nivel ha sido eliminado.', 'success');
        if (this.pagedNiveles?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadNiveles();
      } else {
        Swal.fire('Error', 'No se pudo encontrar el nivel para eliminar.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}