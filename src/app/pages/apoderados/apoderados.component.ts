import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { ApoderadoService } from 'src/app/services/apoderado.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { debounceTime } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

export function pastDateValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!control.value) { return null; }
  const selectedDate = new Date(control.value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate >= today) {
    return { 'futureDate': true };
  }
  return null;
}

@Component({
  selector: 'app-apoderados',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './apoderados.component.html',
  styleUrls: ['./apoderados.component.scss']
})
export class ApoderadosComponent implements OnInit {
  @ViewChild('apoderadoModal') apoderadoModal: TemplateRef<any>;

  GeneroReference = GeneroReference;
  EstadoReference = EstadoReference;
  generoKeys = Object.values(GeneroReference);
  estadoKeys = Object.values(EstadoReference);

  apoderadoForm: FormGroup;
  filterForm: FormGroup;
  isEditMode = false;
  currentApoderadoId: string | null = null;

  pagedApoderados: PageResponse<ApoderadoDto> | undefined;
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private apoderadoService: ApoderadoService,
    private fb: FormBuilder
  ) {
    this.apoderadoForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.maxLength(50)]],
      parentesco: ['', [Validators.required]],
      fechaNacimiento: ['', [Validators.required, pastDateValidator]],
      genero: [GeneroReference.MASCULINO, Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.pattern(/^\d{9}$/)]],
      direccion: [''],
      estado: [EstadoReference.ACTIVO, Validators.required],
    });

    this.filterForm = this.fb.group({
      filtroBusqueda: [''],
      filtroEstado: [EstadoReference.ACTIVO]
    });
  }

  ngOnInit(): void {
    this.loadApoderados();
    this.filterForm.valueChanges.pipe(debounceTime(300)).subscribe(() => {
      this.currentPage = 1;
      this.loadApoderados();
    });
  }

  loadApoderados(): void {
    const page = this.currentPage - 1;
    const { filtroBusqueda, filtroEstado } = this.filterForm.value;
    const estado = filtroEstado === '' ? undefined : filtroEstado;

    this.apoderadoService.getList(page, this.itemsPerPage, filtroBusqueda, estado)
      .subscribe(response => {
        this.pagedApoderados = response;
        this.cdr.detectChanges();
      });
  }

  limpiarFiltros(): void {
    this.filterForm.reset({
      filtroBusqueda: '', filtroEstado: EstadoReference.ACTIVO
    });
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedApoderados && page > this.pagedApoderados.totalPages)) { return; }
    this.currentPage = page;
    this.loadApoderados();
  }

  getPagesArray(): number[] {
    if (!this.pagedApoderados) return [];
    return Array(this.pagedApoderados.totalPages).fill(0).map((x, i) => i + 1);
  }

  openApoderadoModal(apoderado?: ApoderadoDto): void {
    this.isEditMode = !!apoderado;
    this.apoderadoForm.reset();

    if (this.isEditMode && apoderado) {
      this.currentApoderadoId = apoderado.identifier;
      const fechaNac = apoderado.fechaNacimiento ? new Date(apoderado.fechaNacimiento).toISOString().split('T')[0] : '';
      this.apoderadoForm.patchValue({ ...apoderado, fechaNacimiento: fechaNac });
    } else {
      this.currentApoderadoId = null;
      this.apoderadoForm.patchValue({
        genero: GeneroReference.MASCULINO,
        estado: EstadoReference.ACTIVO,
      });
    }
    this.modalService.open(this.apoderadoModal, { centered: true, size: 'lg' });
  }

  onSubmit(): void {
    if (this.apoderadoForm.invalid) {
      this.apoderadoForm.markAllAsTouched();
      Swal.fire('Formulario Inválido', 'Por favor, corrija los errores marcados.', 'error');
      return;
    }

    const apoderadoData = this.apoderadoForm.value;
    const apiCall = this.isEditMode && this.currentApoderadoId
      ? this.apoderadoService.update(this.currentApoderadoId, apoderadoData)
      : this.apoderadoService.add(apoderadoData);

    apiCall.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Apoderado actualizado.' : 'Apoderado añadido.';
        Swal.fire('¡Éxito!', message, 'success');
        this.loadApoderados();
        this.dismiss();
      },
      error: (err: HttpErrorResponse) => {
        let errorMessage = 'Ocurrió un error inesperado.';
        const errorBody = err.error;
        if (errorBody) {
          if (typeof errorBody === 'object' && errorBody.error) {
            errorMessage = errorBody.error;
          } else if (typeof errorBody === 'object' && Object.keys(errorBody).length > 0) {
            errorMessage = Object.values(errorBody).join('<br>');
          } else if (typeof errorBody === 'string') {
            errorMessage = errorBody;
          }
        }
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteApoderado(apoderado: ApoderadoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás al apoderado: ${apoderado.nombre} ${apoderado.apellidoPaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, ¡eliminar!'
    }).then((result) => {
      if (result.isConfirmed && apoderado.identifier) {
        this.deleteApoderado(apoderado.identifier);
      }
    });
  }

  private deleteApoderado(identifier: string): void {
    this.apoderadoService.delete(identifier).subscribe({
      next: () => {
        Swal.fire('¡Eliminado!', 'El apoderado ha sido eliminado.', 'success');
        if (this.pagedApoderados?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadApoderados();
      },
      error: (err) => Swal.fire('Error', err.error?.error || 'No se puede eliminar un apoderado con matrículas asociadas.', 'error')
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }

  get f() {
    return this.apoderadoForm.controls;
  }
}