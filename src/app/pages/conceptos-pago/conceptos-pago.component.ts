import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para NgModel en los formularios de los modales
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Para el manejo de modales
import Swal from 'sweetalert2'; // Para las alertas de confirmación y éxito/error

@Component({
  selector: 'app-conceptos-pago',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule, // Asegúrate de que FormsModule esté incluido aquí
    NgbDropdownModule
  ],
  templateUrl: './conceptos-pago.component.html',
  styleUrl: './conceptos-pago.component.scss'
})
export class ConceptosPagoComponent implements OnInit {

  // Referencias a las plantillas de los modales definidos en el HTML
  @ViewChild('addConceptoModal') addConceptoModal: TemplateRef<any>;
  @ViewChild('editConceptoModal') editConceptoModal: TemplateRef<any>;

  // Objeto que se vinculará al formulario del modal "Añadir Concepto"
  newConcepto: ConceptoPagoDto = {
    identifier: '',
    codigo: '',
    descripcion: '',
    montoSugerido: 0.00, // Valor inicial para el monto
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    cronogramas: [], // Inicializar como array vacío
  };

  // Objeto que almacenará la copia del concepto a editar
  editingConcepto: ConceptoPagoDto | null = null;

  // Datos ficticios para la tabla de conceptos de pago
  conceptosDePago: ConceptoPagoDto[] = [
    {
      identifier: '1',
      codigo: 'MATR',
      descripcion: 'Matrícula',
      montoSugerido: 280.00,
      habilitado: true,
      fechaCreacion: '2024-01-10T10:00:00Z',
      cronogramas: [],
    },
    {
      identifier: '2',
      codigo: 'PENS',
      descripcion: 'Pensión Mensual',
      montoSugerido: 300.00,
      habilitado: true,
      fechaCreacion: '2024-01-11T11:00:00Z',
      cronogramas: [],
    },
  ];

  // Variables de estado para la paginación
  currentPage = 1;
  itemsPerPage = 5; // Cantidad de elementos por página
  pagedConceptos: ConceptoPagoDto[] = []; // Array que contendrá los conceptos de la página actual


  // Inyección de servicios: NgbModal para modales y ChangeDetectorRef para forzar la detección de cambios
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setPage(1); // Inicializa la paginación al cargar el componente
  }

  /**
   * Calcula la porción del array de conceptos a mostrar en la página actual.
   * @param page El número de página al que se desea ir.
   */
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) {
      return; // Evita ir a páginas inválidas
    }

    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.conceptosDePago.length);
    this.pagedConceptos = this.conceptosDePago.slice(startIndex, endIndex);
    this.cdr.detectChanges(); // Fuerza la detección de cambios para actualizar la tabla
  }

  /**
   * Calcula el número total de páginas.
   * @returns El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.conceptosDePago.length / this.itemsPerPage);
  }

  /**
   * Genera un array con los números de página disponibles.
   * @returns Un array de números representando las páginas.
   */
  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }


  /**
   * Cambia el estado de habilitado de un concepto de pago.
   * @param concepto El objeto ConceptoPagoDto a modificar.
   */
  toggleHabilitado(concepto: ConceptoPagoDto) {
    concepto.habilitado = !concepto.habilitado;
    console.log(`Cambiando estado de ${concepto.descripcion}. Nuevo estado: ${concepto.habilitado}`);
    // Aquí iría la llamada al servicio para persistir el cambio en la base de datos
  }

  // --- Métodos para Añadir Concepto ---

  /**
   * Abre el modal para añadir un nuevo concepto de pago.
   */
  openAddConceptoModal() {
    // Reinicia el objeto newConcepto cada vez que se abre el modal para asegurar un formulario limpio
    this.newConcepto = {
      identifier: '',
      codigo: '',
      descripcion: '',
      montoSugerido: 0.00,
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      cronogramas: [],
    };
    this.modalService.open(this.addConceptoModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para guardar un nuevo concepto de pago.
   */
  saveConcepto() {
    // Validación básica de campos obligatorios
    if (!this.newConcepto.codigo || !this.newConcepto.descripcion || this.newConcepto.montoSugerido === null || this.newConcepto.montoSugerido === undefined) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    // Validación para el monto sugerido
    if (this.newConcepto.montoSugerido < 0) {
      Swal.fire('Error', 'El monto sugerido no puede ser negativo.', 'error');
      return;
    }

    // Simulación de generación de un identifier único para el nuevo concepto
    const maxId = Math.max(...this.conceptosDePago.map(c => parseInt(c.identifier || '0')), 0);
    this.newConcepto.identifier = (maxId + 1).toString();

    // Añade el nuevo concepto a la lista local (simulación de guardado)
    this.conceptosDePago.push({ ...this.newConcepto }); // Se añade una copia para evitar problemas de referencia

    // Actualiza la paginación para mostrar el nuevo elemento, generalmente en la última página
    this.setPage(this.getTotalPages());

    Swal.fire('¡Éxito!', 'Concepto de pago añadido correctamente.', 'success');
    console.log('Nuevo concepto de pago guardado:', this.newConcepto);
    // Aquí iría la llamada al servicio para persistir el nuevo concepto en el backend
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Editar Concepto ---

  /**
   * Abre el modal para editar un concepto de pago existente.
   * @param concepto El objeto ConceptoPagoDto a editar.
   */
  openEditConceptoModal(concepto: ConceptoPagoDto) {
    // Crea una copia del objeto concepto para evitar modificar el original directamente en el formulario
    this.editingConcepto = { ...concepto };
    this.modalService.open(this.editConceptoModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un concepto de pago existente.
   */
  updateConcepto() {
    if (!this.editingConcepto) {
      Swal.fire('Error', 'No hay concepto seleccionado para editar.', 'error');
      return;
    }
    // Validación básica de campos obligatorios
    if (!this.editingConcepto.codigo || !this.editingConcepto.descripcion || this.editingConcepto.montoSugerido === null || this.editingConcepto.montoSugerido === undefined) {
      Swal.fire('Error', 'Todos los campos son obligatorios para editar.', 'error');
      return;
    }
    // Validación para el monto sugerido
    if (this.editingConcepto.montoSugerido < 0) {
      Swal.fire('Error', 'El monto sugerido no puede ser negativo.', 'error');
      return;
    }

    // Busca el índice del concepto original en el array y lo actualiza con la copia modificada
    const index = this.conceptosDePago.findIndex(c => c.identifier === this.editingConcepto?.identifier);
    if (index !== -1) {
      this.conceptosDePago[index] = { ...this.editingConcepto }; // Actualiza el concepto con la copia
      // Mantiene la paginación en la página actual
      this.setPage(this.currentPage);

      Swal.fire('¡Éxito!', 'Concepto de pago actualizado correctamente.', 'success');
      console.log('Concepto de pago actualizado:', this.editingConcepto);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Concepto de pago no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Concepto ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un concepto de pago.
   * @param concepto El objeto ConceptoPagoDto a eliminar.
   */
  confirmDeleteConcepto(concepto: ConceptoPagoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el concepto de pago: ${concepto.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteConcepto(concepto.identifier || '');
      }
    });
  }

  /**
   * Elimina un concepto de pago de la lista (simulación).
   * @param identifier El identificador del concepto de pago a eliminar.
   */
  deleteConcepto(identifier: string) {
    const initialLength = this.conceptosDePago.length;
    // Filtra el array para eliminar el concepto con el identifier dado
    this.conceptosDePago = this.conceptosDePago.filter(c => c.identifier !== identifier);

    // Ajusta la paginación después de la eliminación
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages); // Si la página actual quedó vacía, ve a la última válida
    } else if (totalPages === 0) {
      this.pagedConceptos = []; // Si no quedan elementos, vacía la página
      this.currentPage = 1;
    }
    else {
      this.setPage(this.currentPage); // Permanece en la página actual o reajusta si es necesario
    }


    if (this.conceptosDePago.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El concepto de pago ha sido eliminado.',
        'success'
      );
      console.log(`Concepto con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el concepto de pago para eliminar.',
        'error'
      );
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