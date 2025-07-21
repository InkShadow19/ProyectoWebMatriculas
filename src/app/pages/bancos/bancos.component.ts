import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    NgbDropdownModule,
  ],
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent implements OnInit {
  @ViewChild('addBankModal') addBankModal: TemplateRef<any>;
  @ViewChild('editBankModal') editBankModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newBank: Partial<BancoDto> = {};
  editingBank: BancoDto | null = null;

  pagedBancos: PageResponse<BancoDto> | undefined;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef,
    private bancoService: BancoService,
    private authService: AuthService,
    private router: Router
  ) {
    this.estadoKeys = Object.values(EstadoReference);
  }

  ngOnInit(): void {
    this.loadBancos();
    if (!this.authService.hasRole('Administrador')) {
      this.router.navigate(['/access-denied']);
      return;
    }
  }

  loadBancos(): void {
    const page = this.currentPage - 1;
    // La búsqueda se puede hacer por código o descripción, pasamos el mismo término a ambos
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

  // --- Métodos CRUD ---
  openAddBankModal(): void {
    this.newBank = {
      codigo: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO,
    };
    this.modalService.open(this.addBankModal, { centered: true, size: 'lg' });
  }

  saveBank(): void {
    if (!this.newBank.codigo || !this.newBank.descripcion || !this.newBank.estado) {
      Swal.fire('Error', 'Código, descripción y estado son campos obligatorios.', 'error');
      return;
    }
    this.bancoService.add(this.newBank).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Banco añadido correctamente.', 'success');
        this.loadBancos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'No se pudo agregar el banco.', 'error');
      }
    });
  }

  openEditBankModal(banco: BancoDto): void {
    this.editingBank = { ...banco };
    this.modalService.open(this.editBankModal, { centered: true, size: 'lg' });
  }

  updateBank(): void {
    if (!this.editingBank || !this.editingBank.identifier) return;

    if (!this.editingBank.codigo || !this.editingBank.descripcion || !this.editingBank.estado) {
      Swal.fire('Error', 'Código, descripción y estado son campos obligatorios.', 'error');
      return;
    }
    this.bancoService.update(this.editingBank.identifier, this.editingBank).subscribe(success => {
      if (success) {
        Swal.fire('¡Éxito!', 'Banco actualizado correctamente.', 'success');
        this.loadBancos();
        this.dismiss();
      } else {
        Swal.fire('Error', 'Banco no encontrado para actualizar.', 'error');
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
        Swal.fire('Error', 'No se pudo encontrar el banco para eliminar.', 'error');
      }
    });
  }

  dismiss(): void {
    this.modalService.dismissAll();
  }
}