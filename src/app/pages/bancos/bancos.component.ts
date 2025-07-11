import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
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
  ];

  // Propiedades de paginación
  currentPage = 1;
  itemsPerPage = 5;
  pagedBancos: BancoDto[] = [];

  // Inyectar ChangeDetectorRef
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Inicializa la paginación al cargar el componente
    this.setPage(1);
  }

  /**
   * Cambia el estado de habilitado de un banco.
   * @param banco El objeto BancoDto a modificar.
   */
  toggleHabilitado(banco: BancoDto) {
    banco.habilitado = !banco.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${banco.descripcion}. Nuevo estado: ${banco.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  // --- Métodos de Paginación ---

  /**
   * Establece la página actual y actualiza los bancos paginados.
   * @param page El número de página al que se desea ir.
   */
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return; // Evitar páginas inválidas

    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.bancos.length);
    this.pagedBancos = this.bancos.slice(startIndex, endIndex);
    this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la tabla
  }

  /**
   * Calcula el número total de páginas.
   * @returns El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.bancos.length / this.itemsPerPage);
  }

  /**
   * Genera un array con los números de página para la paginación.
   * @returns Un array de números de página.
   */
  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Banco ---

  /**
   * Abre el modal para añadir un nuevo banco.
   */
  openAddBankModal() {
    // Reinicia el objeto newBank al abrir el modal para un formulario limpio
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

  /**
   * Maneja la lógica para guardar un nuevo banco.
   */
  saveBank() {
    if (!this.newBank.codigo || !this.newBank.descripcion) {
      Swal.fire('Error', 'Código y descripción son campos obligatorios para añadir.', 'error');
      return;
    }

    // Generar un nuevo identifier único
    const maxId = Math.max(...this.bancos.map(b => parseInt(b.identifier || '0')), 0);
    this.newBank.identifier = (maxId + 1).toString();

    // Añadir nuevo banco a la lista
    this.bancos.push({ ...this.newBank });

    // Actualizar la paginación para mostrar el nuevo elemento, yendo a la última página
    this.setPage(this.getTotalPages());

    this.cdr.detectChanges(); // Refrescar tabla
    Swal.fire('¡Éxito!', 'Banco añadido correctamente.', 'success');
    console.log('Nuevo banco guardado:', this.newBank);
    this.dismiss(); // Cierra modal
  }

  // --- Métodos para Editar Banco ---

  /**
   * Abre el modal para editar un banco existente.
   * @param banco El objeto BancoDto a editar.
   */
  openEditBankModal(banco: BancoDto) {
    this.editingBank = { ...banco };
    this.modalService.open(this.editBankModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un banco existente.
   */
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

      // Actualizar la paginación para reflejar los cambios en la página actual
      this.setPage(this.currentPage);

      this.cdr.detectChanges(); // Forzar la detección de cambios
      Swal.fire('¡Éxito!', 'Banco actualizado correctamente.', 'success');
      console.log('Banco actualizado:', this.editingBank);
    } else {
      Swal.fire('Error', 'Banco no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Banco ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un banco.
   * @param banco El objeto BancoDto a eliminar.
   */
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

  /**
   * Elimina un banco de la lista (simulación).
   * @param identifier El identificador del banco a eliminar.
   */
  deleteBank(identifier: string) {
    const initialLength = this.bancos.length;

    // Eliminar banco por ID
    this.bancos = this.bancos.filter(banco => banco.identifier !== identifier);

    // Verificar si la página actual quedó vacía o si el último elemento de la última página fue eliminado
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages); // Retroceder a la última página válida si la actual ya no existe
    } else if (totalPages === 0) {
      this.pagedBancos = []; // No hay elementos, vaciar la tabla
      this.currentPage = 1; // Resetear la página actual
    }
    else {
      this.setPage(this.currentPage); // Mantener la página actual
    }

    this.cdr.detectChanges(); // Refrescar tabla

    if (this.bancos.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El banco ha sido eliminado.', 'success');
      console.log(`Banco con ID ${identifier} eliminado.`);
    } else {
      Swal.fire('Error', 'No se pudo encontrar el banco para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---

  /**
   * Cierra todos los modales abiertos.
   */
  dismiss() {
    this.modalService.dismissAll();
  }
}