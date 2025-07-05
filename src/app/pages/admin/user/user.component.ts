import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para NgModel
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { UsuarioDto } from 'src/app/models/usuario.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { RolDto } from 'src/app/models/rol.model'; // Importar RolDto para los roles disponibles
import { NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Para el manejo de modales
import Swal from 'sweetalert2'; // Para las alertas de confirmación y éxito/error
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule, // Asegúrate de que FormsModule esté incluido aquí
    NgbDropdownModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {

  // Referencias a las plantillas de los modales
  @ViewChild('addUserModal') addUserModal: TemplateRef<any>;
  @ViewChild('editUserModal') editUserModal: TemplateRef<any>;

  // Hacemos el enum GeneroReference accesible desde la plantilla HTML
  GeneroReference = GeneroReference;
  // Para iterar sobre el enum en el HTML
  generoKeys: string[];

  // Roles disponibles para el select en el formulario de usuarios
  // En una aplicación real, esta lista vendría de un servicio de roles
  rolesDisponibles: RolDto[] = [
    { identifier: '1', descripcion: 'Administrador', habilitado: true, fechaCreacion: '', usuarios: [] },
    { identifier: '2', descripcion: 'Secretaria', habilitado: true, fechaCreacion: '', usuarios: [] },
    { identifier: '3', descripcion: 'Profesor', habilitado: true, fechaCreacion: '', usuarios: [] },
    { identifier: '4', descripcion: 'Alumno', habilitado: true, fechaCreacion: '', usuarios: [] },
  ];

  // Objeto para el nuevo usuario a añadir
  newUsuario: UsuarioDto = {
    identifier: '',
    usuario: '',
    nombres: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '', // Se inicializará con la fecha actual o vacía
    genero: GeneroReference.MASCULINO, // Género por defecto
    rol: '', // Rol por defecto (se asignará en ngOnInit)
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    pagos: [],
  };

  // Objeto para el usuario que se está editando
  editingUser: UsuarioDto | null = null;

  usuarios: UsuarioDto[] = [
    {
      identifier: '1',
      usuario: 'pfuertes',
      nombres: 'Percy',
      apellidos: 'Fuertes Anaya',
      dni: '45871236',
      fechaNacimiento: '1976-01-15T10:00:00Z',
      genero: GeneroReference.MASCULINO,
      rol: 'Administrador',
      habilitado: true,
      fechaCreacion: '2024-01-15T10:00:00Z',
      pagos: [],
    },
    {
      identifier: '2',
      usuario: 'emartinez',
      nombres: 'Emily',
      apellidos: 'Martinez Diaz',
      dni: '41257896',
      fechaNacimiento: '1997-12-02T10:00:00Z',
      genero: GeneroReference.FEMENINO,
      rol: 'Secretaria',
      habilitado: true,
      fechaCreacion: '2024-02-01T11:30:00Z',
      pagos: [],
    }
  ];

  // Inyección de NgbModal y ChangeDetectorRef
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    // Obtener las claves del enum GeneroReference para usar en el select del HTML
    this.generoKeys = Object.values(GeneroReference) as string[];
  }

  ngOnInit(): void {
    // Establecer el rol por defecto para el nuevo usuario si hay roles disponibles
    if (this.rolesDisponibles.length > 0 && !this.newUsuario.rol) {
      this.newUsuario.rol = this.rolesDisponibles[0].descripcion;
    }
  }

  /**
   * Cambia el estado de habilitado de un usuario.
   * @param usuario El objeto UsuarioDto a modificar.
   */
  toggleHabilitado(usuario: UsuarioDto) {
    usuario.habilitado = !usuario.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${usuario.usuario}. Nuevo estado: ${usuario.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  // --- Métodos para Añadir Usuario ---

  /**
   * Abre el modal para añadir un nuevo usuario.
   */
  openAddUserModal() {
    // Reinicia el objeto newUsuario al abrir el modal para un formulario limpio
    this.newUsuario = {
      identifier: '',
      usuario: '',
      nombres: '',
      apellidos: '',
      dni: '',
      fechaNacimiento: '',
      genero: GeneroReference.MASCULINO, // Valor por defecto
      rol: this.rolesDisponibles.length > 0 ? this.rolesDisponibles[0].descripcion : '', // Primer rol disponible por defecto
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      pagos: [],
    };
    this.modalService.open(this.addUserModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para guardar un nuevo usuario.
   */
  saveUser() {
    // Validación básica de campos obligatorios
    if (!this.newUsuario.usuario || !this.newUsuario.nombres || !this.newUsuario.apellidos ||
        !this.newUsuario.dni || !this.newUsuario.fechaNacimiento || !this.newUsuario.genero ||
        !this.newUsuario.rol) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser completados.', 'error');
      return;
    }

    // Validación de DNI (8 dígitos numéricos)
    if (!/^\d{8}$/.test(this.newUsuario.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }

    // Simulación de generación de un identifier único
    const maxId = Math.max(...this.usuarios.map(u => parseInt(u.identifier || '0')), 0);
    this.newUsuario.identifier = (maxId + 1).toString();

    // Añade el nuevo usuario a la lista local (simulación)
    this.usuarios.push({ ...this.newUsuario });

    this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la tabla

    Swal.fire('¡Éxito!', 'Usuario añadido correctamente.', 'success');
    console.log('Nuevo usuario guardado:', this.newUsuario);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Editar Usuario ---

  /**
   * Abre el modal para editar un usuario existente.
   * @param usuario El objeto UsuarioDto a editar.
   */
  openEditUserModal(usuario: UsuarioDto) {
    // Crea una copia del objeto para evitar modificar el original directamente en el formulario
    // Asegúrate de que la fechaNacimiento sea un string ISO para el input type="date"
    this.editingUser = { ...usuario };
    this.modalService.open(this.editUserModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un usuario existente.
   */
  updateUser() {
    if (!this.editingUser) {
      Swal.fire('Error', 'No hay usuario seleccionado para editar.', 'error');
      return;
    }
    // Validación básica de campos obligatorios
    if (!this.editingUser.usuario || !this.editingUser.nombres || !this.editingUser.apellidos ||
        !this.editingUser.dni || !this.editingUser.fechaNacimiento || !this.editingUser.genero ||
        !this.editingUser.rol) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser completados para editar.', 'error');
      return;
    }

    // Validación de DNI (8 dígitos numéricos)
    if (!/^\d{8}$/.test(this.editingUser.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }

    // Busca el índice del usuario original en el array y lo actualiza
    const index = this.usuarios.findIndex(u => u.identifier === this.editingUser?.identifier);
    if (index !== -1) {
      this.usuarios[index] = { ...this.editingUser }; // Actualiza con la copia modificada
      this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla
      Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
      console.log('Usuario actualizado:', this.editingUser);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Usuario no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Usuario ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un usuario.
   * @param usuario El objeto UsuarioDto a eliminar.
   */
  confirmDeleteUser(usuario: UsuarioDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás al usuario: ${usuario.nombres} ${usuario.apellidos}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteUser(usuario.identifier || '');
      }
    });
  }

  /**
   * Elimina un usuario de la lista (simulación).
   * @param identifier El identificador del usuario a eliminar.
   */
  deleteUser(identifier: string) {
    const initialLength = this.usuarios.length;
    // Filtra el array para eliminar el usuario con el identifier dado
    this.usuarios = this.usuarios.filter(usuario => usuario.identifier !== identifier);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla

    if (this.usuarios.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El usuario ha sido eliminado.',
        'success'
      );
      console.log(`Usuario con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el usuario para eliminar.',
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
  openedMenuId: string | null = null;

  toggleMenu(id: string) {
    this.openedMenuId = this.openedMenuId === id ? null : id;
  }

}