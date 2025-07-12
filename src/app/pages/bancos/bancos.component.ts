import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BancoDto } from 'src/app/models/banco.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

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
  styleUrl: './bancos.component.scss'
})
export class BancosComponent implements OnInit {
  @ViewChild('addBankModal') addBankModal: TemplateRef<any>;
  @ViewChild('editBankModal') editBankModal: TemplateRef<any>;

  // Propiedades para manejar el estado
  EstadoReference = EstadoReference;
  estadoKeys: string[];

  newBank: BancoDto = {
    identifier: '',
    codigo: '',
    descripcion: '',
    estado: EstadoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    pagos: []
  };

  editingBank: BancoDto | null = null;

  bancos: BancoDto[] = [
    {
      identifier: '1',
      codigo: 'BCP',
      descripcion: 'Banco de Crédito del Perú',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: '2023-01-15T09:00:00Z',
      pagos: [],
    },
    {
      identifier: '2',
      codigo: 'IBK',
      descripcion: 'Interbank',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: '2023-02-20T11:30:00Z',
      pagos: [],
    },
    {
      identifier: '3',
      codigo: 'BBVA',
      descripcion: 'BBVA Continental',
      estado: EstadoReference.ACTIVO, 
      fechaCreacion: '2023-03-10T14:00:00Z',
      pagos: [],
    },
    {
      identifier: '4',
      codigo: 'SCO',
      descripcion: 'Scotiabank Perú',
      estado: EstadoReference.INACTIVO, 
      fechaCreacion: '2023-04-05T16:45:00Z',
      pagos: [],
    },
  ];

  currentPage = 1;
  itemsPerPage = 5;
  pagedBancos: BancoDto[] = [];

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[]; // <--- AÑADIDO
  }

  ngOnInit(): void {
    this.setPage(1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos de Paginación ---
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.bancos.length);
    this.pagedBancos = this.bancos.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.bancos.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Banco ---
  openAddBankModal() {
    this.newBank = {
      identifier: '',
      codigo: '',
      descripcion: '',
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      pagos: []
    };
    this.modalService.open(this.addBankModal, { centered: true, size: 'lg' });
  }

  saveBank() {
    if (!this.newBank.codigo || !this.newBank.descripcion || !this.newBank.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Código, descripción y estado son campos obligatorios.', 'error');
      return;
    }
    const maxId = Math.max(...this.bancos.map(b => parseInt(b.identifier || '0')), 0);
    this.newBank.identifier = (maxId + 1).toString();
    this.bancos.push({ ...this.newBank });
    this.setPage(this.getTotalPages());
    this.cdr.detectChanges();
    Swal.fire('¡Éxito!', 'Banco añadido correctamente.', 'success');
    this.dismiss();
  }

  // --- Métodos para Editar Banco ---
  openEditBankModal(banco: BancoDto) {
    this.editingBank = { ...banco };
    this.modalService.open(this.editBankModal, { centered: true, size: 'lg' });
  }

  updateBank() {
    if (!this.editingBank) {
      Swal.fire('Error', 'No hay banco seleccionado para editar.', 'error');
      return;
    }
    if (!this.editingBank.codigo || !this.editingBank.descripcion || !this.editingBank.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Código, descripción y estado son campos obligatorios.', 'error');
      return;
    }
    const index = this.bancos.findIndex(b => b.identifier === this.editingBank?.identifier);
    if (index !== -1) {
      this.bancos[index] = { ...this.editingBank };
      this.setPage(this.currentPage);
      this.cdr.detectChanges();
      Swal.fire('¡Éxito!', 'Banco actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Banco no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  // --- Métodos para Eliminar Banco ---
  confirmDeleteBank(banco: BancoDto) {
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
      if (result.isConfirmed) {
        this.deleteBank(banco.identifier || '');
      }
    });
  }

  deleteBank(identifier: string) {
    const initialLength = this.bancos.length;
    this.bancos = this.bancos.filter(banco => banco.identifier !== identifier);
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages);
    } else if (totalPages === 0) {
      this.pagedBancos = [];
      this.currentPage = 1;
    } else {
      this.setPage(this.currentPage);
    }
    this.cdr.detectChanges();
    if (this.bancos.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El banco ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el banco para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---
  dismiss() {
    this.modalService.dismissAll();
  }
}