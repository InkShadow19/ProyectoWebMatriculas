import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para NgModel
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Para el manejo de modales
import Swal from 'sweetalert2'; // Para las alertas de confirmación y éxito/error

@Component({
  selector: 'app-anios-academicos',
  standalone: true, // Lo definimos como standalone
  imports: [
    CommonModule,   // Necesario para *ngFor y ngClass
    SharedModule,   // Necesario para los íconos <app-keenicon>
    FormsModule,    // Necesario para [(ngModel)]
    NgbDropdownModule,
  ],
  templateUrl: './anios-academicos.component.html',
  styleUrl: './anios-academicos.component.scss'
})
export class AniosAcademicosComponent implements OnInit {

  // Hacemos el enum accesible desde la plantilla HTML
  EstadoAcademicoReference = EstadoAcademicoReference;
  // Para iterar sobre el enum en el HTML
  estadoAcademicoKeys: string[];

  // Referencias a las plantillas de los modales
  @ViewChild('addAnioAcademicoModal') addAnioAcademicoModal: TemplateRef<any>;
  @ViewChild('editAnioAcademicoModal') editAnioAcademicoModal: TemplateRef<any>;

  // Objeto para el nuevo año académico a añadir
  newAnioAcademico: AnioAcademicoDto = {
    identifier: '',
    anio: new Date().getFullYear(), // Año actual por defecto
    estado: EstadoAcademicoReference.FUTURO, // Estado por defecto
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };

  // Objeto para el año académico que se está editando
  editingAnioAcademico: AnioAcademicoDto | null = null;

  // Datos ficticios para la tabla de años académicos
  aniosAcademicos: AnioAcademicoDto[] = [
    {
      identifier: '1',
      anio: 2023,
      estado: EstadoAcademicoReference.CERRADO,
      habilitado: false,
      fechaCreacion: '2023-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '2',
      anio: 2024,
      estado: EstadoAcademicoReference.CERRADO,
      habilitado: true,
      fechaCreacion: '2024-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '3',
      anio: 2025,
      estado: EstadoAcademicoReference.ACTIVO,
      habilitado: true,
      fechaCreacion: '2025-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '4',
      anio: 2026,
      estado: EstadoAcademicoReference.FUTURO,
      habilitado: true,
      fechaCreacion: '2025-07-01T11:00:00Z',
      matriculas: [],
    }
  ];

  // Inyección de NgbModal y ChangeDetectorRef
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    // Obtener las claves del enum para usar en el select del HTML
    this.estadoAcademicoKeys = Object.values(EstadoAcademicoReference) as string[];
  }

  ngOnInit(): void { }

  /**
   * Cambia el estado de habilitado de un año académico.
   * @param anio El objeto AnioAcademicoDto a modificar.
   */
  toggleHabilitado(anio: AnioAcademicoDto) {
    anio.habilitado = !anio.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch en la tabla
    console.log(`Cambiando estado de ${anio.anio}. Nuevo estado: ${anio.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  // --- Métodos para Añadir Año Académico ---

  /**
   * Abre el modal para añadir un nuevo año académico.
   */
  openAddAnioAcademicoModal() {
    // Reinicia el objeto newAnioAcademico al abrir el modal para un formulario limpio
    this.newAnioAcademico = {
      identifier: '',
      anio: new Date().getFullYear(),
      estado: EstadoAcademicoReference.FUTURO,
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para guardar un nuevo año académico.
   */
  saveAnioAcademico() {
    // Validación básica de campos obligatorios
    if (!this.newAnioAcademico.anio || !this.newAnioAcademico.estado) {
      Swal.fire('Error', 'Año y estado son campos obligatorios.', 'error');
      return;
    }
    // Validación de año (ej. no negativo)
    if (this.newAnioAcademico.anio < 1900 || this.newAnioAcademico.anio > 3000) { // Rango de año razonable
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    // Simulación de generación de un identifier único
    const maxId = Math.max(...this.aniosAcademicos.map(a => parseInt(a.identifier || '0')), 0);
    this.newAnioAcademico.identifier = (maxId + 1).toString();

    // Añade el nuevo año académico a la lista local (simulación)
    this.aniosAcademicos.push({ ...this.newAnioAcademico });

    this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la tabla

    Swal.fire('¡Éxito!', 'Año académico añadido correctamente.', 'success');
    console.log('Nuevo año académico guardado:', this.newAnioAcademico);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Editar Año Académico ---

  /**
   * Abre el modal para editar un año académico existente.
   * @param anio El objeto AnioAcademicoDto a editar.
   */
  openEditAnioAcademicoModal(anio: AnioAcademicoDto) {
    // Crea una copia del objeto para evitar modificar el original directamente en el formulario
    this.editingAnioAcademico = { ...anio };
    this.modalService.open(this.editAnioAcademicoModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un año académico existente.
   */
  updateAnioAcademico() {
    if (!this.editingAnioAcademico) {
      Swal.fire('Error', 'No hay año académico seleccionado para editar.', 'error');
      return;
    }
    // Validación básica de campos obligatorios
    if (!this.editingAnioAcademico.anio || !this.editingAnioAcademico.estado) {
      Swal.fire('Error', 'Año y estado son campos obligatorios para editar.', 'error');
      return;
    }
    // Validación de año
    if (this.editingAnioAcademico.anio < 1900 || this.editingAnioAcademico.anio > 3000) {
      Swal.fire('Error', 'El año académico no es válido. Debe ser entre 1900 y 3000.', 'error');
      return;
    }

    // Busca el índice del año original en el array y lo actualiza
    const index = this.aniosAcademicos.findIndex(a => a.identifier === this.editingAnioAcademico?.identifier);
    if (index !== -1) {
      this.aniosAcademicos[index] = { ...this.editingAnioAcademico }; // Actualiza con la copia modificada
      this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla
      Swal.fire('¡Éxito!', 'Año académico actualizado correctamente.', 'success');
      console.log('Año académico actualizado:', this.editingAnioAcademico);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Año académico no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Año Académico ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un año académico.
   * @param anio El objeto AnioAcademicoDto a eliminar.
   */
  confirmDeleteAnioAcademico(anio: AnioAcademicoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el año académico: ${anio.anio}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteAnioAcademico(anio.identifier || '');
      }
    });
  }

  /**
   * Elimina un año académico de la lista (simulación).
   * @param identifier El identificador del año académico a eliminar.
   */
  deleteAnioAcademico(identifier: string) {
    const initialLength = this.aniosAcademicos.length;
    // Filtra el array para eliminar el año académico con el identifier dado
    this.aniosAcademicos = this.aniosAcademicos.filter(a => a.identifier !== identifier);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla

    if (this.aniosAcademicos.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El año académico ha sido eliminado.',
        'success'
      );
      console.log(`Año académico con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el año académico para eliminar.',
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