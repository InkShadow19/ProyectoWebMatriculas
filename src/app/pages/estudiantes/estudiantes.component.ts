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

  // --- PROPIEDADES PARA LA PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 5; // Puedes cambiar este número para mostrar más o menos items por página
  pagedEstudiantes: EstudianteDto[] = []; // Array para los estudiantes de la página actual

  estudiantes: EstudianteDto[] = [
    // --- Registros de Estudiantes ---
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

  constructor(private cdr: ChangeDetectorRef, private modalService: NgbModal) {
    // Obtener las claves del enum GeneroReference para usar en el select del HTML
    this.generoKeys = Object.values(GeneroReference) as string[];
  }

  ngOnInit(): void {
    this.setPage(1); // Carga la primera página al iniciar
  }

  // --- MÉTODOS PARA LA PAGINACIÓN ---

  setPage(page: number) {
    if (page < 1 || page > this.getTotalPages()) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.estudiantes.length - 1);
    this.pagedEstudiantes = this.estudiantes.slice(startIndex, endIndex + 1);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla
  }

  getTotalPages(): number {
    return Math.ceil(this.estudiantes.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- FIN DE MÉTODOS PARA LA PAGINACIÓN ---

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
    const maxId = Math.max(...this.estudiantes.map(e => parseInt(e.identifier || '0')), 0);
    this.newEstudiante.identifier = (maxId + 1).toString();

    // Añade el nuevo estudiante a la lista local (simulación)
    this.estudiantes.push({ ...this.newEstudiante });

    // Re-aplicar paginación para que el nuevo estudiante aparezca en la página correcta
    this.setPage(this.getTotalPages()); // Ir a la última página donde se añadió el nuevo estudiante

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
    // Asegúrate de que la fechaNacimiento sea un string ISO para el input type="date"
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

    // Busca el índice del estudiante original en el array y lo actualiza
    const index = this.estudiantes.findIndex(e => e.identifier === this.editingEstudiante?.identifier);
    if (index !== -1) {
      this.estudiantes[index] = { ...this.editingEstudiante }; // Actualiza con la copia modificada
      this.setPage(this.currentPage); // Re-aplicar paginación para actualizar la vista
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
    const initialLength = this.estudiantes.length;
    // Filtra el array para eliminar el estudiante con el identifier dado
    this.estudiantes = this.estudiantes.filter(estudiante => estudiante.identifier !== identifier);

    // Ajustar la página actual si la última página se queda vacía después de la eliminación
    if (this.pagedEstudiantes.length === 1 && this.currentPage > 1 && this.estudiantes.length === (this.currentPage - 1) * this.itemsPerPage) {
      this.setPage(this.currentPage - 1);
    } else {
      this.setPage(this.currentPage); // Re-aplicar paginación para actualizar la vista
    }

    if (this.estudiantes.length < initialLength) {
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

  // --- Método Genérico ---

  /**
   * Cierra todos los modales abiertos.
   */
  dismiss() {
    this.modalService.dismissAll();
  }
}