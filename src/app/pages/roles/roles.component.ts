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

  currentPage = 1;
  itemsPerPage = 5;
  pagedRoles: RolDto[] = [];

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) return;

    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.roles.length);
    this.pagedRoles = this.roles.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.roles.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }


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

  ngOnInit(): void {
    this.setPage(1);
  }

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
    if (!this.newRol.descripcion) {
      Swal.fire('Error', 'La descripción del rol es obligatoria.', 'error');
      return;
    }

    const maxId = Math.max(...this.roles.map(r => parseInt(r.identifier || '0')), 0);
    this.newRol.identifier = (maxId + 1).toString();

    this.roles.push({ ...this.newRol });

    // Actualizar la página a la última para ver el nuevo rol
    this.setPage(this.getTotalPages());

    this.cdr.detectChanges();
    Swal.fire('¡Éxito!', 'Rol añadido correctamente.', 'success');
    console.log('Nuevo rol guardado:', this.newRol);

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

    if (!this.editingRol.descripcion) {
      Swal.fire('Error', 'La descripción del rol es obligatoria para editar.', 'error');
      return;
    }

    const index = this.roles.findIndex(r => r.identifier === this.editingRol?.identifier);
    if (index !== -1) {
      this.roles[index] = { ...this.editingRol };

      // 🔁 ¡ACTUALIZA la lista de la página actual!
      this.setPage(this.currentPage);

      this.cdr.detectChanges();
      Swal.fire('¡Éxito!', 'Rol actualizado correctamente.', 'success');
      console.log('Rol actualizado:', this.editingRol);
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
    this.roles = this.roles.filter(rol => rol.identifier !== identifier);

    // Ajusta la página actual si al eliminar queda vacía
    const totalPages = this.getTotalPages();
    if (this.currentPage > totalPages) {
      this.setPage(totalPages);
    } else {
      this.setPage(this.currentPage);
    }

    this.cdr.detectChanges();

    if (this.roles.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El rol ha sido eliminado.', 'success');
      console.log(`Rol con ID ${identifier} eliminado.`);
    } else {
      Swal.fire('Error', 'No se pudo encontrar el rol para eliminar.', 'error');
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