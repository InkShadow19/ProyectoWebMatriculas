import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { AnioAcademicoService } from 'src/app/services/anio-academico.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

// Validador personalizado para el rango del año
export function anioRangoValido(control: AbstractControl): ValidationErrors | null {
  const anio = control.value;
  const anioActual = new Date().getFullYear();
  if (anio && anio > anioActual + 4) {
    return { anioFueraDeRango: true };
  }
  return null;
}

@Component({
  selector: 'app-anios-academicos',
  standalone: true,
  imports: [
    CommonModule, SharedModule, FormsModule, ReactiveFormsModule, NgbDropdownModule,
  ],
  templateUrl: './anios-academicos.component.html',
  styleUrls: ['./anios-academicos.component.scss']
})
export class AniosAcademicosComponent implements OnInit {
  @ViewChild('anioAcademicoModal') anioAcademicoModal: TemplateRef<any>;

  EstadoAcademicoReference = EstadoAcademicoReference;
  estadoAcademicoKeys: string[];
  
  anioForm: FormGroup;
  isEditing = false;
  
  pagedAniosAcademicos: PageResponse<AnioAcademicoDto> | undefined;
  filtroBusqueda: number | null = null;
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private anioAcademicoService: AnioAcademicoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoAcademicoKeys = Object.values(EstadoAcademicoReference).filter(e => e !== EstadoAcademicoReference.UNDEFINED && e !== EstadoAcademicoReference.EGRESADO && e !== EstadoAcademicoReference.RETIRADO);
    this.anioForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadAniosAcademicos();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
    }
  }

  initForm(): FormGroup {
    const anioActual = new Date().getFullYear();
    return this.fb.group({
      identifier: [null],
      anio: [anioActual, [Validators.required, Validators.pattern(/^[0-9]{4}$/), anioRangoValido]],
      estadoAcademico: [EstadoAcademicoReference.FUTURO, Validators.required]
    });
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
    if (page < 1 || (this.pagedAniosAcademicos && page > this.pagedAniosAcademicos.totalPages)) return;
    this.currentPage = page;
    this.loadAniosAcademicos();
  }

  getPagesArray(): number[] {
    if (!this.pagedAniosAcademicos) return [];
    return Array(this.pagedAniosAcademicos.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddAnioAcademicoModal(): void {
    this.isEditing = false;
    this.anioForm.reset({
      anio: new Date().getFullYear(),
      estadoAcademico: EstadoAcademicoReference.FUTURO
    });
    this.modalService.open(this.anioAcademicoModal, { centered: true, size: 'lg' });
  }

  openEditAnioAcademicoModal(anio: AnioAcademicoDto): void {
    this.isEditing = true;
    this.anioForm.patchValue(anio);
    this.modalService.open(this.anioAcademicoModal, { centered: true, size: 'lg' });
  }

  saveAnioAcademico(): void {
    if (this.anioForm.invalid) {
      this.anioForm.markAllAsTouched();
      return;
    }

    const formValue = this.anioForm.value;
    const request = this.isEditing 
      ? this.anioAcademicoService.update(formValue.identifier, formValue)
      : this.anioAcademicoService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Año académico actualizado' : 'Año académico añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadAniosAcademicos();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteAnioAcademico(anio: AnioAcademicoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el año académico: ${anio.anio}. ¡No podrás revertir esto!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && anio.identifier) {
        this.deleteAnioAcademico(anio.identifier);
      }
    });
  }

  private deleteAnioAcademico(identifier: string): void {
    this.anioAcademicoService.delete(identifier).subscribe({
        next: () => {
            Swal.fire('¡Eliminado!', 'El año académico ha sido eliminado.', 'success');
            this.loadAniosAcademicos();
        },
        error: (err) => {
            const errorMessage = err.error?.error || 'No se pudo eliminar el año académico.';
            Swal.fire('Error', errorMessage, 'error');
        }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}