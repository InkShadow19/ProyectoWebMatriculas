import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { GradoService } from 'src/app/services/grado.service';
import { NivelService } from 'src/app/services/nivel.service';
import { NivelDto } from 'src/app/models/nivel.model';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './grados.component.html',
  styleUrls: ['./grados.component.scss'],
})
export class GradosComponent implements OnInit {
  @ViewChild('gradoModal') gradoModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  nivelesDisponibles: NivelDto[] = [];
  
  gradoForm: FormGroup;
  isEditing = false;

  pagedGrados: PageResponse<GradoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  filtroNivel: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private gradoService: GradoService,
    private nivelService: NivelService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoKeys = Object.values(EstadoReference).filter(e => e !== EstadoReference.UNDEFINED);
    this.gradoForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadNiveles();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
    }
  }

  initForm(): FormGroup {
    return this.fb.group({
      identifier: [null],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      nivel: ['', Validators.required],
      estado: [EstadoReference.ACTIVO, Validators.required],
    });
  }

  loadNiveles(): void {
    this.nivelService.getList(0, 100, undefined, EstadoReference.ACTIVO).subscribe(response => {
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

  openAddGradoModal(): void {
    this.isEditing = false;
    this.gradoForm.reset({ nivel: '', estado: EstadoReference.ACTIVO });
    this.modalService.open(this.gradoModal, { centered: true, size: 'lg' });
  }

  openEditGradoModal(grado: GradoDto): void {
    this.isEditing = true;
    this.gradoForm.patchValue(grado);
    this.gradoForm.controls['nivel'].disable(); // No se puede cambiar el nivel de un grado
    this.modalService.open(this.gradoModal, { centered: true, size: 'lg' });
  }

  saveGrado(): void {
    if (this.gradoForm.invalid) {
      this.gradoForm.markAllAsTouched();
      return;
    }

    const formValue = this.gradoForm.getRawValue(); // Usar getRawValue para incluir campos deshabilitados
    const request = this.isEditing 
      ? this.gradoService.update(formValue.identifier, formValue)
      : this.gradoService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Grado actualizado' : 'Grado añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadGrados();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteGrado(grado: GradoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el grado: ${grado.descripcion}. ¡No podrás revertir esto!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && grado.identifier) {
        this.deleteGrado(grado.identifier);
      }
    });
  }

  private deleteGrado(identifier: string): void {
    this.gradoService.delete(identifier).subscribe({
      next: () => {
        Swal.fire('¡Eliminado!', 'El grado ha sido eliminado.', 'success');
        this.loadGrados();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'No se pudo eliminar el grado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
    this.gradoForm.controls['nivel'].enable(); // Habilitar de nuevo por si se vuelve a abrir
  }
}