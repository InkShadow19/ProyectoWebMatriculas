import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Necesario para NgModel
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { RolDto } from 'src/app/models/rol.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap'; // Para el manejo de modales
import Swal from 'sweetalert2'; // Para las alertas de confirmación y éxito/error

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule, // Asegúrate de que FormsModule esté incluido aquí
    NgbDropdownModule,
  ],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {

  // Referencias a las plantillas de los modales
  @ViewChild('addRolModal') addRolModal: TemplateRef<any>;
  @ViewChild('editRolModal') editRolModal: TemplateRef<any>;

  // Objeto para el nuevo rol a añadir
  newRol: RolDto = {
    identifier: '',
    descripcion: '',
    habilitado: true,
    fechaCreacion: new Date().toISOString(),
    usuarios: [], // Asumiendo que RolDto tiene un array de usuarios
  };

  // Objeto para el rol que se está editando
  editingRol: RolDto | null = null;

  roles: RolDto[] = [
    {
      identifier: '1',
      descripcion: 'Administrador',
      habilitado: true,
      fechaCreacion: '2024-01-10T09:00:00Z',
      usuarios: [],
    },
    {
      identifier: '2',
      descripcion: 'Secretaria',
      habilitado: true,
      fechaCreacion: '2024-01-11T10:30:00Z',
      usuarios: [],
    }
  ];

  // Inyección de NgbModal y ChangeDetectorRef
  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  /**
   * Cambia el estado de habilitado de un rol.
   * @param rol El objeto RolDto a modificar.
   */
  toggleHabilitado(rol: RolDto) {
    rol.habilitado = !rol.habilitado;
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar el switch
    console.log(`Cambiando estado de ${rol.descripcion}. Nuevo estado: ${rol.habilitado}`);
    // Aquí iría la llamada al servicio para guardar el cambio en la base de datos
  }

  // --- Métodos para Añadir Rol ---

  /**
   * Abre el modal para añadir un nuevo rol.
   */
  openAddRolModal() {
    // Reinicia el objeto newRol al abrir el modal para un formulario limpio
    this.newRol = {
      identifier: '',
      descripcion: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      usuarios: [],
    };
    this.modalService.open(this.addRolModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para guardar un nuevo rol.
   */
  saveRol() {
    // Validación básica de campos obligatorios
    if (!this.newRol.descripcion) {
      Swal.fire('Error', 'La descripción del rol es obligatoria.', 'error');
      return;
    }

    // Simulación de generación de un identifier único
    const maxId = Math.max(...this.roles.map(r => parseInt(r.identifier || '0')), 0);
    this.newRol.identifier = (maxId + 1).toString();

    // Añade el nuevo rol a la lista local (simulación)
    this.roles.push({ ...this.newRol });

    this.cdr.detectChanges(); // Forzar la detección de cambios para actualizar la tabla

    Swal.fire('¡Éxito!', 'Rol añadido correctamente.', 'success');
    console.log('Nuevo rol guardado:', this.newRol);
    // Aquí iría la llamada al servicio para persistir en el backend
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Editar Rol ---

  /**
   * Abre el modal para editar un rol existente.
   * @param rol El objeto RolDto a editar.
   */
  openEditRolModal(rol: RolDto) {
    // Crea una copia del objeto para evitar modificar el original directamente en el formulario
    this.editingRol = { ...rol };
    this.modalService.open(this.editRolModal, { centered: true, size: 'lg' });
  }

  /**
   * Maneja la lógica para actualizar un rol existente.
   */
  updateRol() {
    if (!this.editingRol) {
      Swal.fire('Error', 'No hay rol seleccionado para editar.', 'error');
      return;
    }
    // Validación básica de campos obligatorios
    if (!this.editingRol.descripcion) {
      Swal.fire('Error', 'La descripción del rol es obligatoria para editar.', 'error');
      return;
    }

    // Busca el índice del rol original en el array y lo actualiza
    const index = this.roles.findIndex(r => r.identifier === this.editingRol?.identifier);
    if (index !== -1) {
      this.roles[index] = { ...this.editingRol }; // Actualiza con la copia modificada
      this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla
      Swal.fire('¡Éxito!', 'Rol actualizado correctamente.', 'success');
      console.log('Rol actualizado:', this.editingRol);
      // Aquí iría la llamada al servicio para persistir la actualización en el backend
    } else {
      Swal.fire('Error', 'Rol no encontrado para actualizar.', 'error');
    }
    this.dismiss(); // Cierra el modal
  }

  // --- Métodos para Eliminar Rol ---

  /**
   * Muestra un diálogo de confirmación de SweetAlert2 antes de eliminar un rol.
   * @param rol El objeto RolDto a eliminar.
   */
  confirmDeleteRol(rol: RolDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el rol: ${rol.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteRol(rol.identifier || '');
      }
    });
  }

  /**
   * Elimina un rol de la lista (simulación).
   * @param identifier El identificador del rol a eliminar.
   */
  deleteRol(identifier: string) {
    const initialLength = this.roles.length;
    // Filtra el array para eliminar el rol con el identifier dado
    this.roles = this.roles.filter(rol => rol.identifier !== identifier);
    this.cdr.detectChanges(); // Forzar detección de cambios para actualizar la tabla

    if (this.roles.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El rol ha sido eliminado.',
        'success'
      );
      console.log(`Rol con ID ${identifier} eliminado.`);
      // Aquí iría la llamada al servicio para eliminar en el backend
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el rol para eliminar.',
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