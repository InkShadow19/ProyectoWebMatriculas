import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

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

  // Propiedades para manejar el estado
  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newConcepto: ConceptoPagoDto = {
    identifier: '',
    codigo: '',
    descripcion: '',
    montoSugerido: 0.00,
    estado: EstadoReference.ACTIVO, // <--- CAMBIADO
    fechaCreacion: new Date().toISOString(),
    cronogramas: [],
  };

  editingConcepto: ConceptoPagoDto | null = null;
  conceptosDePago: ConceptoPagoDto[] = [
    {
      identifier: '1',
      codigo: 'MATR',
      descripcion: 'Matrícula',
      montoSugerido: 280.00,
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: '2024-01-10T10:00:00Z',
      cronogramas: [],
    },
    {
      identifier: '2',
      codigo: 'PENS',
      descripcion: 'Pensión Mensual',
      montoSugerido: 300.00,
      estado: EstadoReference.INACTIVO, // <--- CAMBIADO
      fechaCreacion: '2024-01-11T11:00:00Z',
      cronogramas: [],
    },
  ];

  currentPage = 1;
  itemsPerPage = 5;
  pagedConceptos: ConceptoPagoDto[] = [];

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
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.conceptosDePago.length);
    this.pagedConceptos = this.conceptosDePago.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.conceptosDePago.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos para Añadir Concepto ---
  openAddConceptoModal() {
    this.newConcepto = {
      identifier: '',
      codigo: '',
      descripcion: '',
      montoSugerido: 0.00,
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      cronogramas: [],
    };
    this.modalService.open(this.addConceptoModal, { centered: true, size: 'lg' });
  }

  saveConcepto() {
    if (!this.newConcepto.codigo || !this.newConcepto.descripcion || this.newConcepto.montoSugerido === null || !this.newConcepto.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    if (this.newConcepto.montoSugerido < 0) {
      Swal.fire('Error', 'El monto sugerido no puede ser negativo.', 'error');
      return;
    }

    const maxId = Math.max(...this.conceptosDePago.map(c => parseInt(c.identifier || '0')), 0);
    this.newConcepto.identifier = (maxId + 1).toString();
    this.conceptosDePago.push({ ...this.newConcepto });
    this.setPage(this.getTotalPages());
    Swal.fire('¡Éxito!', 'Concepto de pago añadido correctamente.', 'success');
    this.dismiss();
  }

  // --- Métodos para Editar Concepto ---
  openEditConceptoModal(concepto: ConceptoPagoDto) {
    this.editingConcepto = { ...concepto };
    this.modalService.open(this.editConceptoModal, { centered: true, size: 'lg' });
  }

  updateConcepto() {
    if (!this.editingConcepto) {
      Swal.fire('Error', 'No hay concepto seleccionado para editar.', 'error');
      return;
    }
    if (!this.editingConcepto.codigo || !this.editingConcepto.descripcion || this.editingConcepto.montoSugerido === null || !this.editingConcepto.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios para editar.', 'error');
      return;
    }
    if (this.editingConcepto.montoSugerido < 0) {
      Swal.fire('Error', 'El monto sugerido no puede ser negativo.', 'error');
      return;
    }

    const index = this.conceptosDePago.findIndex(c => c.identifier === this.editingConcepto?.identifier);
    if (index !== -1) {
      this.conceptosDePago[index] = { ...this.editingConcepto };
      this.setPage(this.currentPage);
      Swal.fire('¡Éxito!', 'Concepto de pago actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Concepto de pago no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  // --- Métodos para Eliminar Concepto ---
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
      if (result.isConfirmed) {
        this.deleteConcepto(concepto.identifier || '');
      }
    });
  }

  deleteConcepto(identifier: string) {
    const initialLength = this.conceptosDePago.length;
    this.conceptosDePago = this.conceptosDePago.filter(c => c.identifier !== identifier);
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else if (totalPages === 0) {
      this.pagedConceptos = [];
      this.currentPage = 1;
    } else {
      this.setPage(this.currentPage);
    }

    if (this.conceptosDePago.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El concepto de pago ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el concepto de pago para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---
  dismiss() {
    this.modalService.dismissAll();
  }
}