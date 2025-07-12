import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';

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
  estadoKeys: string[];

  newConcepto: ConceptoPagoDto = {
    identifier: '',
    codigo: '',
    descripcion: '',
    montoSugerido: 0.00,
    estado: EstadoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    cronogramas: [],
  };

  editingConcepto: ConceptoPagoDto | null = null;
  
  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allConceptosDePago: ConceptoPagoDto[] = [
    { identifier: '1', codigo: 'MATR', descripcion: 'Matrícula', montoSugerido: 280.00, estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-10T10:00:00Z', cronogramas: [] },
    { identifier: '2', codigo: 'PENS', descripcion: 'Pensión Mensual', montoSugerido: 300.00, estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-11T11:00:00Z', cronogramas: [] },
    { identifier: '3', codigo: 'CERT', descripcion: 'Certificado de Estudios', montoSugerido: 50.00, estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-12T12:00:00Z', cronogramas: [] },
  ];
  filteredConceptosDePago: ConceptoPagoDto[] = [];
  pagedConceptos: ConceptoPagoDto[] = [];

  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let conceptosTemp = [...this.allConceptosDePago];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    if (this.filtroEstado) {
      conceptosTemp = conceptosTemp.filter(concepto => concepto.estado === this.filtroEstado);
    }

    if (searchTerm) {
      conceptosTemp = conceptosTemp.filter(concepto =>
        concepto.descripcion.toLowerCase().includes(searchTerm) ||
        concepto.codigo.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredConceptosDePago = conceptosTemp;
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

    if (this.filteredConceptosDePago.length === 0) {
      this.pagedConceptos = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredConceptosDePago.length);
    this.pagedConceptos = this.filteredConceptosDePago.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredConceptosDePago.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos CRUD ---
  openAddConceptoModal() {
    this.newConcepto = {
      identifier: '',
      codigo: '',
      descripcion: '',
      montoSugerido: 0.00,
      estado: EstadoReference.ACTIVO,
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

    const maxId = Math.max(...this.allConceptosDePago.map(c => parseInt(c.identifier || '0')), 0);
    this.newConcepto.identifier = (maxId + 1).toString();
    this.allConceptosDePago.push({ ...this.newConcepto });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Concepto de pago añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditConceptoModal(concepto: ConceptoPagoDto) {
    this.editingConcepto = { ...concepto };
    this.modalService.open(this.editConceptoModal, { centered: true, size: 'lg' });
  }

  updateConcepto() {
    if (!this.editingConcepto) { return; }
    if (!this.editingConcepto.codigo || !this.editingConcepto.descripcion || this.editingConcepto.montoSugerido === null || !this.editingConcepto.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios para editar.', 'error');
      return;
    }
    if (this.editingConcepto.montoSugerido < 0) {
      Swal.fire('Error', 'El monto sugerido no puede ser negativo.', 'error');
      return;
    }

    const index = this.allConceptosDePago.findIndex(c => c.identifier === this.editingConcepto?.identifier);
    if (index !== -1) {
      this.allConceptosDePago[index] = { ...this.editingConcepto };
      this.aplicarFiltroYPaginar();
      Swal.fire('¡Éxito!', 'Concepto de pago actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Concepto de pago no encontrado para actualizar.', 'error');
    }
    this.dismiss();
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
      if (result.isConfirmed) {
        this.deleteConcepto(concepto.identifier || '');
      }
    });
  }

  deleteConcepto(identifier: string) {
    const initialLength = this.allConceptosDePago.length;
    this.allConceptosDePago = this.allConceptosDePago.filter(c => c.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allConceptosDePago.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El concepto de pago ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el concepto de pago para eliminar.', 'error');
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}