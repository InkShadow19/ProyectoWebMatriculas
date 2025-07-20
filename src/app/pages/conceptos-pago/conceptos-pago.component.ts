import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { ConceptoPagoService } from 'src/app/services/concepto-pago.service';
import { PageResponse } from 'src/app/models/page-response.model';

@Component({
  selector: 'app-conceptos-pago',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './conceptos-pago.component.html',
  styleUrl: './conceptos-pago.component.scss'
})
export class ConceptosPagoComponent implements OnInit {
  @ViewChild('addConceptoModal') addConceptoModal: TemplateRef<any>;
  @ViewChild('editConceptoModal') editConceptoModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys = Object.values(EstadoReference);

  newConcepto: Partial<ConceptoPagoDto> = {};
  editingConcepto: ConceptoPagoDto | null = null;

  pagedConceptos: PageResponse<ConceptoPagoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: EstadoReference | '' = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private conceptoPagoService: ConceptoPagoService
  ) { }

  ngOnInit(): void {
    this.loadConceptos();
  }

  loadConceptos(): void {
    const page = this.currentPage - 1;
    const estado = this.filtroEstado === '' ? undefined : this.filtroEstado;
    this.conceptoPagoService.getList(page, this.itemsPerPage, this.filtroBusqueda, estado)
      .subscribe(response => {
        this.pagedConceptos = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadConceptos();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedConceptos && page > this.pagedConceptos.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadConceptos();
  }

  getPagesArray(): number[] {
    if (!this.pagedConceptos) return [];
    return Array(this.pagedConceptos.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddConceptoModal() {
    this.newConcepto = {
      estado: EstadoReference.ACTIVO,
      montoSugerido: 0.00,
    };
    this.modalService.open(this.addConceptoModal, { centered: true, size: 'lg' });
  }

  saveConcepto() {
    if (!this.newConcepto.codigo || !this.newConcepto.descripcion || this.newConcepto.montoSugerido === null) {
      Swal.fire('Error', 'Los campos Código, Descripción y Monto son obligatorios.', 'error');
      return;
    }

    this.conceptoPagoService.add(this.newConcepto).subscribe(conceptoAgregado => {
      if (conceptoAgregado) {
        Swal.fire('¡Éxito!', 'Concepto de pago añadido correctamente.', 'success');
        this.loadConceptos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el concepto de pago.', 'error');
      }
    });
  }

  openEditConceptoModal(concepto: ConceptoPagoDto) {
    this.editingConcepto = { ...concepto };
    this.modalService.open(this.editConceptoModal, { centered: true, size: 'lg' });
  }

  updateConcepto() {
    if (!this.editingConcepto || !this.editingConcepto.identifier) return;

    this.conceptoPagoService.update(this.editingConcepto.identifier, this.editingConcepto).subscribe(conceptoActualizado => {
      if (conceptoActualizado) {
        Swal.fire('¡Éxito!', 'Concepto de pago actualizado correctamente.', 'success');
        this.loadConceptos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Hubo un problema al actualizar el concepto.', 'error');
      }
    });
  }

  confirmDeleteConcepto(concepto: ConceptoPagoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el concepto: ${concepto.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && concepto.identifier) {
        this.deleteConcepto(concepto.identifier);
      }
    });
  }

  private deleteConcepto(identifier: string): void {
    this.conceptoPagoService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El concepto de pago ha sido eliminado.', 'success');
        if (this.pagedConceptos?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadConceptos();
      } else {
        Swal.fire('Error', 'No se pudo eliminar el concepto de pago.', 'error');
      }
    });
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}
