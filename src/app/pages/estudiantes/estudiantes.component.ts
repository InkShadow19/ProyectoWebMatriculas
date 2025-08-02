import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { debounceTime } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

// Validador personalizado para la fecha de nacimiento
export function ageRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
  if (!control.value) {
    return null; 
  }

  const birthDate = new Date(control.value);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();

  // Ajustar edad si el cumpleaños de este año aún no ha pasado
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Comprobar si la edad está fuera del rango de 3 a 20 años
  if (age < 3 || age > 20) { 
    return { 'ageRange': true };
  }

  return null; // Devuelve null si la validación es exitosa
}

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    NgbDropdownModule
  ],
  templateUrl: './estudiantes.component.html',
  styleUrls: ['./estudiantes.component.scss']
})
export class EstudiantesComponent implements OnInit {
  @ViewChild('estudianteModal') estudianteModal: TemplateRef<any>;

  GeneroReference = GeneroReference;
  EstadoAcademicoReference = EstadoAcademicoReference;
  generoKeys = Object.values(GeneroReference);
  estadoAcademicoKeys: EstadoAcademicoReference[] = [
    EstadoAcademicoReference.ACTIVO,
    EstadoAcademicoReference.RETIRADO,
    EstadoAcademicoReference.EGRESADO,
  ];

  estudianteForm: FormGroup;
  filterForm: FormGroup;
  isEditMode = false;
  currentEstudianteId: string | null = null;

  pagedEstudiantes: PageResponse<EstudianteDto> | undefined;
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private cdr: ChangeDetectorRef,
    private modalService: NgbModal,
    private estudianteService: EstudianteService,
    private fb: FormBuilder
  ) {
    this.estudianteForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoPaterno: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidoMaterno: ['', [Validators.maxLength(50)]],
      fechaNacimiento: ['', [Validators.required, ageRangeValidator]],
      genero: [GeneroReference.MASCULINO, Validators.required],
      direccion: [''],
      telefono: ['', [Validators.pattern(/^9\d{8}$/)]],
      email: ['', [Validators.required, Validators.email]],
      estadoAcademico: [EstadoAcademicoReference.ACTIVO, Validators.required],
    });

    this.filterForm = this.fb.group({
      filtroBusqueda: [''],
      filtroEstado: [EstadoAcademicoReference.ACTIVO]
    });
  }

  ngOnInit(): void {
    this.loadEstudiantes();
    this.filterForm.valueChanges.pipe(
      debounceTime(300)
    ).subscribe(() => {
      this.currentPage = 1;
      this.loadEstudiantes();
    });
  }

  loadEstudiantes(): void {
    const page = this.currentPage - 1;
    const { filtroBusqueda, filtroEstado } = this.filterForm.value;
    const estado = filtroEstado === '' ? undefined : filtroEstado;

    this.estudianteService.getList(page, this.itemsPerPage, filtroBusqueda, estado)
      .subscribe(response => {
        this.pagedEstudiantes = response;
        this.cdr.detectChanges();
      });
  }

  limpiarFiltros(): void {
    this.filterForm.reset({
      filtroBusqueda: '', filtroEstado: EstadoAcademicoReference.ACTIVO
    });
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedEstudiantes && page > this.pagedEstudiantes.totalPages)) { return; }
    this.currentPage = page;
    this.loadEstudiantes();
  }

  getPagesArray(): number[] {
    if (!this.pagedEstudiantes) return [];
    return Array(this.pagedEstudiantes.totalPages).fill(0).map((x, i) => i + 1);
  }

  openEstudianteModal(estudiante?: EstudianteDto): void {
    this.isEditMode = !!estudiante;
    this.estudianteForm.reset();

    if (this.isEditMode && estudiante) {
      this.currentEstudianteId = estudiante.identifier;
      const fechaNac = estudiante.fechaNacimiento ? new Date(estudiante.fechaNacimiento).toISOString().split('T')[0] : '';
      this.estudianteForm.patchValue({ ...estudiante, fechaNacimiento: fechaNac });
    } else {
      this.currentEstudianteId = null;
      this.estudianteForm.patchValue({
        genero: GeneroReference.MASCULINO,
        estadoAcademico: EstadoAcademicoReference.ACTIVO,
      });
    }
    this.modalService.open(this.estudianteModal, { centered: true, size: 'lg' });
  }

  onSubmit(): void {
    if (this.estudianteForm.invalid) {
      this.estudianteForm.markAllAsTouched();
      Swal.fire('Formulario Inválido', 'Por favor, corrija los errores marcados.', 'error');
      return;
    }

    const estudianteData = this.estudianteForm.value;
    const apiCall = this.isEditMode && this.currentEstudianteId
      ? this.estudianteService.update(this.currentEstudianteId, estudianteData)
      : this.estudianteService.add(estudianteData);

    apiCall.subscribe({
      next: () => {
        const message = this.isEditMode ? 'Estudiante actualizado correctamente.' : 'Estudiante añadido correctamente.';
        Swal.fire('¡Éxito!', message, 'success');
        this.loadEstudiantes();
        this.dismiss();
      },
      // --- BLOQUE DE ERROR CORREGIDO Y ROBUSTECIDO ---
      error: (err: HttpErrorResponse) => {
        console.error('Error completo recibido del backend:', err);

        let errorMessage = 'Ocurrió un error inesperado.';
        const errorBody = err.error;

        if (errorBody) {
          // Caso 1: AppException de unicidad (el cuerpo del error tiene una propiedad 'error')
          if (typeof errorBody === 'object' && errorBody.error) {
            errorMessage = errorBody.error;
          }
          // Caso 2: Error de validación @Valid (el cuerpo del error tiene los nombres de los campos)
          else if (typeof errorBody === 'object' && Object.keys(errorBody).length > 0) {
            errorMessage = Object.values(errorBody).join('<br>');
          }
          // Caso 3: El cuerpo del error es simplemente un texto
          else if (typeof errorBody === 'string') {
            errorMessage = errorBody;
          }
        }

        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteEstudiante(estudiante: EstudianteDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Se eliminará a ${estudiante.nombre} ${estudiante.apellidoPaterno}`,
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
    this.estudianteService.delete(identifier).subscribe({
      next: () => {
        Swal.fire('¡Eliminado!', 'El estudiante ha sido eliminado.', 'success');
        if (this.pagedEstudiantes?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadEstudiantes();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'No se puede eliminar un alumno con matrículas asociadas.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }

  get f() {
    return this.estudianteForm.controls;
  }
}
