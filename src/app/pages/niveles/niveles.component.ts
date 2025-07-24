import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { NivelService } from 'src/app/services/nivel.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, ReactiveFormsModule, NgbDropdownModule],
  templateUrl: './niveles.component.html',
  styleUrls: ['./niveles.component.scss'],
})
export class NivelesComponent implements OnInit {
  @ViewChild('nivelModal') nivelModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  
  nivelForm: FormGroup;
  isEditing = false;
  
  pagedNiveles: PageResponse<NivelDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private nivelService: NivelService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoKeys = Object.values(EstadoReference).filter(e => e !== EstadoReference.UNDEFINED) as string[];
    this.nivelForm = this.initForm();
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
      descripcion: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
        Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]*$/) // Solo letras y espacios
      ]],
      estado: [EstadoReference.ACTIVO, Validators.required],
    });
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
    if (page < 1 || (this.pagedNiveles && page > this.pagedNiveles.totalPages)) return;
    this.currentPage = page;
    this.loadNiveles();
  }

  getPagesArray(): number[] {
    if (!this.pagedNiveles) return [];
    return Array(this.pagedNiveles.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddNivelModal(): void {
    this.isEditing = false;
    this.nivelForm.reset({ estado: EstadoReference.ACTIVO });
    this.modalService.open(this.nivelModal, { centered: true, size: 'lg' });
  }

  openEditNivelModal(nivel: NivelDto): void {
    this.isEditing = true;
    this.nivelForm.patchValue(nivel);
    this.modalService.open(this.nivelModal, { centered: true, size: 'lg' });
  }

  saveNivel(): void {
    if (this.nivelForm.invalid) {
      this.nivelForm.markAllAsTouched();
      return;
    }

    const formValue = this.nivelForm.value;
    const request = this.isEditing 
      ? this.nivelService.update(formValue.identifier, formValue)
      : this.nivelService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Nivel actualizado' : 'Nivel añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadNiveles();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteNivel(nivel: NivelDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el nivel: ${nivel.descripcion}. ¡No podrás revertir esto!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && nivel.identifier) {
        this.deleteNivel(nivel.identifier);
      }
    });
  }

  private deleteNivel(identifier: string): void {
    this.nivelService.delete(identifier).subscribe({
      next: () => {
        Swal.fire('¡Eliminado!', 'El nivel ha sido eliminado.', 'success');
        this.loadNiveles();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'No se pudo eliminar el nivel.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}