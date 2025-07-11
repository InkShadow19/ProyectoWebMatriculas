import {
  Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './niveles.component.html',
  styleUrl: './niveles.component.scss',
})
export class NivelesComponent implements OnInit {
  @ViewChild('addNivelModal') addNivelModal: TemplateRef<any>;
  @ViewChild('editNivelModal') editNivelModal: TemplateRef<any>;

  // Propiedades para la paginación
  currentPage = 1;
  itemsPerPage = 5; // Cantidad de elementos por página
  pagedNiveles: NivelDto[] = []; // Array que contendrá los niveles de la página actual

  niveles: NivelDto[] = [
    { identifier: '1', descripcion: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '2', descripcion: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '3', descripcion: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
  ];

  newNivel: NivelDto = { identifier: '', descripcion: '', habilitado: true, fechaCreacion: '', grados: [], matriculas: [] };
  editingNivel: NivelDto | null = null;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { } // Inyectar ChangeDetectorRef

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
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.niveles.length);
    this.pagedNiveles = this.niveles.slice(startIndex, endIndex);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la vista
  }

  /**
   * Calcula el número total de páginas basado en la cantidad de elementos y elementos por página.
   * @returns El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.niveles.length / this.itemsPerPage);
  }

  /**
   * Genera un array con los números de página para mostrar en los controles de paginación.
   * @returns Un array de números que representan las páginas disponibles.
   */
  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  toggleHabilitado(nivel: NivelDto) {
    nivel.habilitado = !nivel.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${nivel.descripcion}. Nuevo estado: ${nivel.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  openAddNivelModal() {
    this.newNivel = {
      identifier: '',
      descripcion: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      grados: [],
      matriculas: [],
    };
    this.modalService.open(this.addNivelModal, { centered: true, size: 'lg' });
  }

  openEditNivelModal(nivel: NivelDto) {
    this.editingNivel = { ...nivel };
    this.modalService.open(this.editNivelModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveNivel() {
    if (!this.newNivel.descripcion) {
      Swal.fire('Error', 'La descripción es obligatoria.', 'error');
      return;
    }
    const maxId = Math.max(...this.niveles.map(n => parseInt(n.identifier || '0')), 0);
    this.newNivel.identifier = (maxId + 1).toString();
    this.niveles.push({ ...this.newNivel });

    // Actualiza la paginación para mostrar el nuevo elemento, yendo a la última página
    this.setPage(this.getTotalPages());

    Swal.fire('¡Éxito!', 'Nivel añadido correctamente.', 'success');
    console.log('Nuevo nivel guardado:', this.newNivel);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss();
  }

  updateNivel() {
    if (!this.editingNivel || !this.editingNivel.descripcion) {
      Swal.fire('Error', 'La descripción es obligatoria.', 'error');
      return;
    }

    const index = this.niveles.findIndex(n => n.identifier === this.editingNivel!.identifier);
    if (index !== -1) {
      this.niveles[index] = { ...this.editingNivel! };

      // Mantiene la paginación en la página actual
      this.setPage(this.currentPage);

      Swal.fire('¡Éxito!', 'Nivel actualizado correctamente.', 'success');
      console.log('Nivel actualizado:', this.editingNivel);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Nivel no encontrado.', 'error');
    }
    this.dismiss();
  }

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un nivel.
   * @param nivel El objeto NivelDto a eliminar.
   */
  confirmDeleteNivel(nivel: NivelDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el nivel: ${nivel.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteNivel(nivel.identifier || '');
      }
    });
  }

  /**
   * Elimina un nivel de la lista (simulación).
   * @param identifier El identificador del nivel a eliminar.
   */
  deleteNivel(identifier: string) {
    const initialLength = this.niveles.length;

    // Filtra el array para eliminar el nivel con el identifier dado
    this.niveles = this.niveles.filter(n => n.identifier !== identifier);

    // Ajustar la paginación después de la eliminación
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages && totalPages > 0) {
      this.setPage(totalPages); // Retroceder a la última página si la actual ya no existe
    } else if (totalPages === 0) {
      this.pagedNiveles = []; // Si no quedan elementos, vaciar la tabla paginada
    }
    else {
      this.setPage(this.currentPage); // Mantener la página actual
    }

    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla

    if (this.niveles.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El nivel ha sido eliminado.',
        'success'
      );
      console.log(`Nivel con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el nivel para eliminar.',
        'error'
      );
    }
  }
}