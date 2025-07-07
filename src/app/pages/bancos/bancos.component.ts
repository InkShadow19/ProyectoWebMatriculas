import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core'; // Importar ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BancoDto } from 'src/app/models/banco.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

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

  newBank: BancoDto = {
    identifier: '',
    codigo: '',
    descripcion: '',
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    pagos: []
  };

  editingBank: BancoDto | null = null;

  bancos: BancoDto[] = [
    {
      identifier: '1',
      codigo: 'BCP',
      descripcion: 'Banco de Crédito del Perú',
      habilitado: true,
      fechaCreacion: '2023-01-15T09:00:00Z',
      pagos: [],
    },
    {
      identifier: '2',
      codigo: 'IBK',
      descripcion: 'Interbank',
      habilitado: true,
      fechaCreacion: '2023-02-20T11:30:00Z',
      pagos: [],
    },
    {
      identifier: '3',
      codigo: 'BBVA',
      descripcion: 'BBVA Continental',
      habilitado: true,
      fechaCreacion: '2023-03-10T14:00:00Z',
      pagos: [],
    },
    {
      identifier: '4',
      codigo: 'SCO',
      descripcion: 'Scotiabank Perú',
      habilitado: false,
      fechaCreacion: '2023-04-05T16:45:00Z',
      pagos: [],
    },
    {
      identifier: '5',
      codigo: 'BN',
      descripcion: 'Banco de la Nación',
      habilitado: true,
      fechaCreacion: '2023-05-01T08:20:00Z',
      pagos: [],
    },
  ];

  // Inyectar ChangeDetectorRef
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  toggleHabilitado(banco: BancoDto) {
    banco.habilitado = !banco.habilitado;
    console.log(`Cambiando estado de ${banco.descripcion}. Nuevo estado: ${banco.habilitado}`);
  }

  openAddBankModal() {
    this.newBank = {
      identifier: '',
      codigo: '',
      descripcion: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      pagos: []
    };
    this.modalService.open(this.addBankModal, { centered: true, size: 'lg' });
  }

  openEditBankModal(banco: BancoDto) {
    this.editingBank = { ...banco };
    this.modalService.open(this.editBankModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveBank() {
    if (!this.newBank.codigo || !this.newBank.descripcion) {
      Swal.fire('Error', 'Código y descripción son campos obligatorios para añadir.', 'error');
      return;
    }

    this.newBank.identifier = (Math.max(...this.bancos.map(b => parseInt(b.identifier || '0')), 0) + 1).toString();
    this.bancos.push({ ...this.newBank });

    Swal.fire('¡Éxito!', 'Banco añadido correctamente.', 'success');
    console.log('Nuevo banco guardado:', this.newBank);
    this.dismiss();
  }

  updateBank() {
    if (!this.editingBank) {
      Swal.fire('Error', 'No hay banco seleccionado para editar.', 'error');
      return;
    }

    if (!this.editingBank.codigo || !this.editingBank.descripcion) {
      Swal.fire('Error', 'Código y descripción son campos obligatorios para editar.', 'error');
      return;
    }

    const index = this.bancos.findIndex(b => b.identifier === this.editingBank?.identifier);
    if (index !== -1) {
      this.bancos[index] = { ...this.editingBank };
      Swal.fire('¡Éxito!', 'Banco actualizado correctamente.', 'success');
      console.log('Banco actualizado:', this.editingBank);
    } else {
      Swal.fire('Error', 'Banco no encontrado para actualizar.', 'error');
    }

    this.dismiss();
  }

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

    console.log(`Intentando eliminar banco con ID: ${identifier}`);
    console.log('Estado del array "bancos" DESPUÉS del filtro:', this.bancos);

    if (this.bancos.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El banco ha sido eliminado.',
        'success'
      );
      // Forzar la detección de cambios para que la UI se actualice
      this.cdr.detectChanges(); // O this.cdr.markForCheck(); si la estrategia de detección de cambios del componente es OnPush
      // Aquí harías la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el banco para eliminar.',
        'error'
      );
    }
  }
}