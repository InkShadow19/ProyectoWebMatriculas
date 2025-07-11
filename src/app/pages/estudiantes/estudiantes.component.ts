import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para NgModel
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; // Para el manejo de modales y dropdown
import Swal from 'sweetalert2'; // Para las alertas de confirmación y éxito/error

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule, // Asegúrate de que FormsModule esté incluido aquí
    NgbDropdownModule // Asegúrate de que NgbDropdownModule esté incluido aquí
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss'
})
export class EstudiantesComponent implements OnInit {

  // Referencias a las plantillas de los modales
  @ViewChild('addEstudianteModal') addEstudianteModal: TemplateRef<any>;
  @ViewChild('editEstudianteModal') editEstudianteModal: TemplateRef<any>;

  // Hacemos el enum GeneroReference accesible desde la plantilla HTML
  GeneroReference = GeneroReference;
  // Para iterar sobre el enum en el HTML
  generoKeys: string[];

  // Objeto para el nuevo estudiante a añadir
  newEstudiante: EstudianteDto = {
    identifier: '',
    dni: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '', // Se inicializará con la fecha actual o vacía
    genero: GeneroReference.MASCULINO, // Género por defecto
    email: '',
    telefono: '',
    direccion: '',
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };

  // Objeto para el estudiante que se está editando
  editingEstudiante: EstudianteDto | null = null;

  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  filtroBusqueda: string = ''; // Nuevo: Propiedad para el campo de búsqueda rápida
  allEstudiantes: EstudianteDto[] = [
    // --- Registros de Estudiantes (Datos de ejemplo) ---
    { identifier: '1', dni: '78945612', nombre: 'Carlos', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', fechaNacimiento: '2010-05-15', genero: GeneroReference.MASCULINO, direccion: 'Av. Los Proceres 123, Surco', telefono: '987654321', email: 'carlos.vargas@email.com', habilitado: true, fechaCreacion: '2024-01-20T10:00:00Z', matriculas: [] },
    { identifier: '2', dni: '71234567', nombre: 'Ana', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', fechaNacimiento: '2011-08-22', genero: GeneroReference.FEMENINO, direccion: 'Jr. de la Union 456, Lima', telefono: '912345678', email: 'ana.ruiz@email.com', habilitado: true, fechaCreacion: '2024-01-22T11:30:00Z', matriculas: [] },
    { identifier: '3', dni: '75689123', nombre: 'Pedro', apellidoPaterno: 'Gomez', apellidoMaterno: 'Perez', fechaNacimiento: '2010-03-10', genero: GeneroReference.MASCULINO, direccion: 'Calle Las Begonias 789, San Isidro', telefono: '998877665', email: 'pedro.gomez@email.com', habilitado: false, fechaCreacion: '2023-11-05T14:00:00Z', matriculas: [] },
    { identifier: '4', dni: '76543210', nombre: 'Lucia', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Rojas', fechaNacimiento: '2012-01-30', genero: GeneroReference.FEMENINO, direccion: 'Av. Arequipa 2450, Lince', telefono: '955443322', email: 'lucia.mendoza@email.com', habilitado: true, fechaCreacion: '2024-02-01T08:00:00Z', matriculas: [] },
    { identifier: '5', dni: '74125896', nombre: 'Javier', apellidoPaterno: 'Soto', apellidoMaterno: 'Diaz', fechaNacimiento: '2011-11-11', genero: GeneroReference.MASCULINO, direccion: 'Av. Javier Prado 550, San Borja', telefono: '963258741', email: 'javier.soto@email.com', habilitado: true, fechaCreacion: '2024-02-03T16:20:00Z', matriculas: [] },
    { identifier: '6', dni: '79876543', nombre: 'Sofia', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', fechaNacimiento: '2010-09-05', genero: GeneroReference.FEMENINO, direccion: 'Urb. Santa Patricia, La Molina', telefono: '987123456', email: 'sofia.quispe@email.com', habilitado: true, fechaCreacion: '2024-02-05T12:00:00Z', matriculas: [] },
    { identifier: '7', dni: '70102030', nombre: 'Mateo', apellidoPaterno: 'Flores', apellidoMaterno: 'Castillo', fechaNacimiento: '2012-07-18', genero: GeneroReference.MASCULINO, direccion: 'Av. Angamos 987, Miraflores', telefono: '940123789', email: 'mateo.flores@email.com', habilitado: true, fechaCreacion: '2024-02-10T09:45:00Z', matriculas: [] },
    { identifier: '8', dni: '72345678', nombre: 'Valentina', apellidoPaterno: 'Chavez', apellidoMaterno: 'Gutierrez', fechaNacimiento: '2011-04-25', genero: GeneroReference.FEMENINO, direccion: 'Calle Schell 345, Miraflores', telefono: '932165498', email: 'valentina.chavez@email.com', habilitado: true, fechaCreacion: '2024-02-11T15:00:00Z', matriculas: [] },
    { identifier: '9', dni: '78765432', nombre: 'Diego', apellidoPaterno: 'Ramos', apellidoMaterno: 'Morales', fechaNacimiento: '2010-02-14', genero: GeneroReference.MASCULINO, direccion: 'Av. Benavides 1540, Miraflores', telefono: '921345678', email: 'diego.ramos@email.com', habilitado: true, fechaCreacion: '2024-02-12T18:10:00Z', matriculas: [] },
    { identifier: '10', dni: '71122334', nombre: 'Camila', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva', fechaNacimiento: '2012-12-01', genero: GeneroReference.FEMENINO, direccion: 'Jr. Huiracocha 2050, Jesus Maria', telefono: '911223344', email: 'camila.castro@email.com', habilitado: false, fechaCreacion: '2024-02-15T10:00:00Z', matriculas: [] },
  ];
  filteredEstudiantes: EstudianteDto[] = []; // Almacena los estudiantes después de aplicar el filtro de búsqueda

  currentPage: number = 1;
  itemsPerPage: number = 5; // Puedes cambiar este número para mostrar más o menos items por página
  pagedEstudiantes: EstudianteDto[] = []; // Array para los estudiantes de la página actual

  constructor(private cdr: ChangeDetectorRef, private modalService: NgbModal) {
    // Obtener las claves del enum GeneroReference para usar en el select del HTML
    this.generoKeys = Object.values(GeneroReference) as string[];
  }

  ngOnInit(): void {
    // Inicialmente, filteredEstudiantes es igual a allEstudiantes, y luego se pagina
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos para el filtro de búsqueda rápida y paginación ---

  /**
   * Aplica el filtro de búsqueda rápida y luego actualiza la paginación.
   */
  aplicarFiltroYPaginar(): void {
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    if (searchTerm) {
      this.filteredEstudiantes = this.allEstudiantes.filter(estudiante => {
        const nombreCompleto = `${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}`.toLowerCase();
        const dni = estudiante.dni; // DNI ya es un string, no necesita toLowerCase si solo contiene números
        return nombreCompleto.includes(searchTerm) || dni.includes(searchTerm);
      });
    } else {
      this.filteredEstudiantes = [...this.allEstudiantes]; // Si no hay término de búsqueda, muestra todos
    }

    this.setPage(1); // Siempre vuelve a la primera página después de un nuevo filtro
  }

  /**
   * Actualiza los estudiantes que se muestran en la página actual.
   * @param page El número de página a mostrar.
   */
  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) {
      // Si no hay resultados filtrados y se intenta ir a una página, y ya no hay páginas válidas
      if (this.filteredEstudiantes.length === 0 && totalPages === 0) {
        this.pagedEstudiantes = []; // Asegurarse de que la tabla esté vacía
        this.currentPage = 1; // Resetea la página actual
        this.cdr.detectChanges();
        return;
      }
      // Si la página solicitada es inválida pero hay resultados, ajusta a la última página si es posible
      if (page > totalPages && totalPages > 0) {
        this.currentPage = totalPages;
      } else if (page < 1 && totalPages > 0) {
        this.currentPage = 1;
      } else {
        return; // Si no hay páginas válidas ni resultados, simplemente retorna
      }
    } else {
      this.currentPage = page;
    }


    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.filteredEstudiantes.length - 1);
    this.pagedEstudiantes = this.filteredEstudiantes.slice(startIndex, endIndex + 1);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla
  }

  /**
   * Calcula el número total de páginas basado en los estudiantes filtrados.
   * @returns El número total de páginas.
   */
  getTotalPages(): number {
    return Math.ceil(this.filteredEstudiantes.length / this.itemsPerPage);
  }

  /**
   * Genera un array de números de página para la paginación.
   * @returns Un array de números de página.
   */
  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- FIN DE MÉTODOS PARA LA PAGINACIÓN Y FILTRO ---


  /**
   * Cambia el estado de habilitado de un estudiante.
   * @param estudiante El objeto EstudianteDto a modificar.
   */
  toggleHabilitado(estudiante: EstudianteDto) {
    estudiante.habilitado = !estudiante.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${estudiante.nombre}. Nuevo estado: ${estudiante.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  // --- Métodos para Añadir Estudiante ---

  /**
   * Abre el modal para añadir un nuevo estudiante.
   */
  openAddEstudianteModal() {
    // Reinicia el objeto newEstudiante al abrir el modal para un formulario limpio
    this.newEstudiante = {
      identifier: '',
      dni: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      genero: GeneroReference.MASCULINO, // Valor por defecto
      email: '',
      telefono: '',
      direccion: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addEstudianteModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para guardar un nuevo estudiante.
   */
  saveEstudiante() {
    // Validación básica de campos obligatorios
    if (!this.newEstudiante.dni || !this.newEstudiante.nombre || !this.newEstudiante.apellidoPaterno ||
      !this.newEstudiante.fechaNacimiento || !this.newEstudiante.genero || !this.newEstudiante.email) {
      Swal.fire('Error', 'Los campos DNI, Nombres, Apellido Paterno, Fecha de Nacimiento, Género y Email son obligatorios.', 'error');
      return;
    }

    // Validación de DNI (8 dígitos numéricos)
    if (!/^\d{8}$/.test(this.newEstudiante.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }

    // Validación de Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newEstudiante.email)) {
      Swal.fire('Error', 'El formato del email no es válido.', 'error');
      return;
    }

    // Simulación de generación de un identifier único
    // Busca el ID máximo en allEstudiantes para asegurar unicidad
    const maxId = Math.max(...this.allEstudiantes.map(e => parseInt(e.identifier || '0')), 0);
    this.newEstudiante.identifier = (maxId + 1).toString();

    // Añade el nuevo estudiante a la lista completa de estudiantes
    this.allEstudiantes.push({ ...this.newEstudiante });

    // Vuelve a aplicar los filtros y la paginación para que el nuevo estudiante aparezca
    this.aplicarFiltroYPaginar();

    Swal.fire('¡Éxito!', 'Estudiante añadido correctamente.', 'success');
    console.log('Nuevo estudiante guardado:', this.newEstudiante);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Editar Estudiante ---

  /**
   * Abre el modal para editar un estudiante existente.
   * @param estudiante El objeto EstudianteDto a editar.
   */
  openEditEstudianteModal(estudiante: EstudianteDto) {
    // Crea una copia del objeto para evitar modificar el original directamente en el formulario
    this.editingEstudiante = { ...estudiante };
    this.modalService.open(this.editEstudianteModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un estudiante existente.
   */
  updateEstudiante() {
    if (!this.editingEstudiante) {
      Swal.fire('Error', 'No hay estudiante seleccionado para editar.', 'error');
      return;
    }
    // Validación básica de campos obligatorios
    if (!this.editingEstudiante.dni || !this.editingEstudiante.nombre || !this.editingEstudiante.apellidoPaterno ||
      !this.editingEstudiante.fechaNacimiento || !this.editingEstudiante.genero || !this.editingEstudiante.email) {
      Swal.fire('Error', 'Los campos DNI, Nombres, Apellido Paterno, Fecha de Nacimiento, Género y Email son obligatorios para editar.', 'error');
      return;
    }

    // Validación de DNI (8 dígitos numéricos)
    if (!/^\d{8}$/.test(this.editingEstudiante.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }

    // Validación de Email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editingEstudiante.email)) {
      Swal.fire('Error', 'El formato del email no es válido.', 'error');
      return;
    }

    // Busca el índice del estudiante original en el array allEstudiantes y lo actualiza
    const index = this.allEstudiantes.findIndex(e => e.identifier === this.editingEstudiante?.identifier);
    if (index !== -1) {
      this.allEstudiantes[index] = { ...this.editingEstudiante }; // Actualiza con la copia modificada
      this.aplicarFiltroYPaginar(); // Vuelve a aplicar filtros y paginar para reflejar el cambio
      Swal.fire('¡Éxito!', 'Estudiante actualizado correctamente.', 'success');
      console.log('Estudiante actualizado:', this.editingEstudiante);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Estudiante no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Estudiante ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un estudiante.
   * @param estudiante El objeto EstudianteDto a eliminar.
   */
  confirmDeleteEstudiante(estudiante: EstudianteDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás al estudiante: ${estudiante.nombre} ${estudiante.apellidoPaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteEstudiante(estudiante.identifier || '');
      }
    });
  }

  /**
   * Elimina un estudiante de la lista (simulación).
   * @param identifier El identificador del estudiante a eliminar.
   */
  deleteEstudiante(identifier: string) {
    const initialLength = this.allEstudiantes.length;
    // Filtra el array allEstudiantes para eliminar el estudiante con el identifier dado
    this.allEstudiantes = this.allEstudiantes.filter(estudiante => estudiante.identifier !== identifier);

    // Vuelve a aplicar los filtros y la paginación para actualizar la vista
    this.aplicarFiltroYPaginar();

    if (this.allEstudiantes.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El estudiante ha sido eliminado.',
        'success'
      );
      console.log(`Estudiante con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el estudiante para eliminar.',
        'error'
      );
    }
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = ''; 
    this.aplicarFiltroYPaginar();
  }

  // --- Método Genérico ---

  /**
   * Cierra todos los modales abiertos.
   */
  dismiss() {
    this.modalService.dismissAll();
  }
}