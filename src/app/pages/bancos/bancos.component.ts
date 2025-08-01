import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { BancoDto } from 'src/app/models/banco.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { BancoService } from 'src/app/services/banco.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/modules/auth';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    NgbDropdownModule,
  ],
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {
  @ViewChild('bankModal') bankModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  
  bancoForm: FormGroup;
  isEditing = false;
  
  pagedBancos: PageResponse<BancoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private bancoService: BancoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoKeys = Object.values(EstadoReference);
    this.bancoForm = this.initForm();
  }

  ngOnInit(): void {
    this.loadBancos();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
  }
  
  initForm(): FormGroup {
    return this.fb.group({
      identifier: [null],
      codigo: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(15)]],
      descripcion: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(150)]],
      estado: [EstadoReference.ACTIVO, Validators.required]
    });
  }

  loadBancos(): void {
    const page = this.currentPage - 1;
    this.bancoService.getList(page, this.itemsPerPage, this.filtroBusqueda, this.filtroBusqueda, this.filtroEstado)
      .subscribe(response => {
        this.pagedBancos = response;
        this.cdr.detectChanges();
      });
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadBancos();
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.onFilterChange();
  }

  setPage(page: number): void {
    if (page < 1 || (this.pagedBancos && page > this.pagedBancos.totalPages)) return;
    this.currentPage = page;
    this.loadBancos();
  }

  getPagesArray(): number[] {
    if (!this.pagedBancos) return [];
    return Array(this.pagedBancos.totalPages).fill(0).map((x, i) => i + 1);
  }

  openAddBankModal(): void {
    this.isEditing = false;
    this.bancoForm.reset({ estado: EstadoReference.ACTIVO });
    this.modalService.open(this.bankModal, { centered: true, size: 'lg' });
  }

  openEditBankModal(banco: BancoDto): void {
    this.isEditing = true;
    this.bancoForm.patchValue(banco);
    this.modalService.open(this.bankModal, { centered: true, size: 'lg' });
  }

  saveBank(): void {
    if (this.bancoForm.invalid) {
      this.bancoForm.markAllAsTouched();
      return;
    }

    const formValue = this.bancoForm.value;
    const request = this.isEditing 
      ? this.bancoService.update(formValue.identifier, formValue)
      : this.bancoService.add(formValue);

    request.subscribe({
      next: () => {
        const message = this.isEditing ? 'Banco actualizado' : 'Banco añadido';
        Swal.fire('¡Éxito!', `${message} correctamente.`, 'success');
        this.loadBancos();
        this.dismiss();
      },
      error: (err) => {
        const errorMessage = err.error?.error || 'Ocurrió un error inesperado.';
        Swal.fire('Error', errorMessage, 'error');
      }
    });
  }

  confirmDeleteBank(banco: BancoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el banco: ${banco.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed && banco.identifier) {
        this.deleteBank(banco.identifier);
      }
    });
  }

  private deleteBank(identifier: string): void {
    this.bancoService.delete(identifier).subscribe(success => {
      if (success) {
        Swal.fire('¡Eliminado!', 'El banco ha sido eliminado.', 'success');
        if (this.pagedBancos?.content.length === 1 && this.currentPage > 1) {
          this.currentPage--;
        }
        this.loadBancos();
      } else {
        Swal.fire('Error', 'No se puede eliminar este banco porque ya tiene pagos registrados.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}