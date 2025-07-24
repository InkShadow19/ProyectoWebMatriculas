import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { ConceptoPagoService } from 'src/app/services/concepto-pago.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-conceptos-pago',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './conceptos-pago.component.html',
  styleUrl: './conceptos-pago.component.scss'
})
export class ConceptosPagoComponent implements OnInit {
  @ViewChild('conceptoModal') conceptoModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys = Object.values(EstadoReference);
  
  conceptoForm: FormGroup;
  isEditing = false;
  
  pagedConceptos: PageResponse<ConceptoPagoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: EstadoReference | '' = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private conceptoPagoService: ConceptoPagoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.conceptoForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadConceptos();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
  }

  initForm(): FormGroup {
    return this.fb.group({
      identifier: [null],
      codigo: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]],
      descripcion: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      montoSugerido: [null, [Validators.required, Validators.min(0)]],
      estado: [EstadoReference.ACTIVO, Validators.required]
    });
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
    this.isEditing = false;
    this.conceptoForm.reset({ estado: EstadoReference.ACTIVO, montoSugerido: 0.00 });
    this.modalService.open(this.conceptoModal, { centered: true, size: 'lg' });
  }

  openEditConceptoModal(concepto: ConceptoPagoDto) {
    this.isEditing = true;
    this.conceptoForm.patchValue(concepto);
    this.modalService.open(this.conceptoModal, { centered: true, size: 'lg' });
  }

  saveConcepto() {
    if (this.conceptoForm.invalid) {
      this.conceptoForm.markAllAsTouched();
      return;
    }

    const formValue = this.conceptoForm.value;
    const request = this.isEditing
      ? this.conceptoPagoService.update(formValue.identifier, formValue)
      : this.conceptoPagoService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Concepto de pago actualizado' : 'Concepto de pago añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadConceptos();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
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
