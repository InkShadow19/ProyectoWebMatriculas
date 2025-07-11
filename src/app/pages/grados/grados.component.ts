import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.scss',
})
export class GradosComponent implements OnInit {
  @ViewChild('addGradoModal') addGradoModal: TemplateRef<any>;
  @ViewChild('editGradoModal') editGradoModal: TemplateRef<any>;

  // Propiedades para la paginación
  currentPage = 1;
  itemsPerPage = 5; // Cantidad de elementos por página
  pagedGrados: GradoDto[] = []; // Array que contendrá los grados de la página actual

  grados: GradoDto[] = [
    { identifier: '1', descripcion: '3 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '2', descripcion: '4 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '3', descripcion: '5 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '4', descripcion: '1er Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '5', descripcion: '2do Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
  ];

  newGrado: GradoDto = { identifier: '', descripcion: '', nivel: '', habilitado: true, fechaCreacion: '', matriculas: [] };
  editingGrado: GradoDto | null = null;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.setPage(1); // Inicializa la paginación al cargar el componente
  }

  // --- Métodos de Paginación ---

  /**
   * Establece la página actual de la tabla y actualiza los elementos mostrados.
   * @param page El número de página a la que se desea ir.
   */
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    // Evita ir a páginas inválidas
    if (page < 1 || page > totalPages) {
      return;
    }

    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.grados.length);
    this.pagedGrados = this.grados.slice(startIndex, endIndex);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la vista
  }

  /**
   * Calcula el número total de páginas basado en la cantidad de elementos y elementos por página.
   * @returns El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.grados.length / this.itemsPerPage);
  }

  /**
   * Genera un array con los números de página para mostrar en los controles de paginación.
   * @returns Un array de números que representan las páginas disponibles.
   */
  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  toggleHabilitado(grado: GradoDto) {
    grado.habilitado = !grado.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${grado.descripcion}. Nuevo estado: ${grado.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  openAddGradoModal() {
    this.newGrado = {
      identifier: '',
      descripcion: '',
      nivel: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addGradoModal, { centered: true, size: 'lg' });
  }

  openEditGradoModal(grado: GradoDto) {
    this.editingGrado = { ...grado };
    this.modalService.open(this.editGradoModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveGrado() {
    if (!this.newGrado.descripcion || !this.newGrado.nivel) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    const maxId = Math.max(...this.grados.map(g => parseInt(g.identifier || '0')), 0);
    this.newGrado.identifier = (maxId + 1).toString();
    this.grados.push({ ...this.newGrado });

    // Actualiza la paginación para mostrar el nuevo elemento, yendo a la última página
    this.setPage(this.getTotalPages());
    this.cdr.detectChanges(); // Asegura que la UI se actualice

    Swal.fire('¡Éxito!', 'Grado añadido correctamente.', 'success');
    console.log('Nuevo grado guardado:', this.newGrado);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss();
  }

  updateGrado() {
    if (!this.editingGrado || !this.editingGrado.descripcion || !this.editingGrado.nivel) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    const index = this.grados.findIndex(g => g.identifier === this.editingGrado!.identifier);
    if (index !== -1) {
      this.grados[index] = { ...this.editingGrado! };

      // Mantiene la paginación en la página actual
      this.setPage(this.currentPage);
      this.cdr.detectChanges(); // Asegura que la UI se actualice

      Swal.fire('¡Éxito!', 'Grado actualizado correctamente.', 'success');
      console.log('Grado actualizado:', this.editingGrado);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Grado no encontrado.', 'error');
    }
    this.dismiss();
  }

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un grado.
   * @param grado El objeto GradoDto a eliminar.
   */
  confirmDeleteGrado(grado: GradoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el grado: ${grado.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGrado(grado.identifier || '');
      }
    });
  }

  /**
   * Elimina un grado de la lista (simulación).
   * @param identifier El identificador del grado a eliminar.
   */
  deleteGrado(identifier: string) {
    const initialLength = this.grados.length;

    // Filtra el array para eliminar el grado con el identifier dado
    this.grados = this.grados.filter(grado => grado.identifier !== identifier);

    // Ajustar la paginación después de la eliminación
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages); // Retroceder a la última página si la actual ya no existe
    } else if (totalPages === 0) {
      this.pagedGrados = []; // Si no quedan elementos, vaciar la tabla paginada
    } else {
      this.setPage(this.currentPage); // Mantener la página actual
    }

    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla

    if (this.grados.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El grado ha sido eliminado.', 'success');
      console.log(`Grado con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire('Error', 'No se pudo encontrar el grado para eliminar.', 'error');
    }
  }
}