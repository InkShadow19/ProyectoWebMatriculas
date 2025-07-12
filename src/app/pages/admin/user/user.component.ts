import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { UsuarioDto } from 'src/app/models/usuario.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { RolDto } from 'src/app/models/rol.model';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  EstadoReference = EstadoReference;
  GeneroReference = GeneroReference;
  generoKeys: string[];
  estadoKeys: string[];

  @ViewChild('addUserModal') addUserModal: TemplateRef<any>;
  @ViewChild('editUserModal') editUserModal: TemplateRef<any>;

  rolesDisponibles: RolDto[] = [
    { identifier: '1', descripcion: 'Administrador', estado: EstadoReference.ACTIVO, fechaCreacion: '', usuarios: [] },
    { identifier: '2', descripcion: 'Secretaria', estado: EstadoReference.ACTIVO, fechaCreacion: '', usuarios: [] },
  ];

  newUsuario: UsuarioDto = {
    identifier: '',
    usuario: '',
    nombres: '',
    apellidos: '',
    dni: '',
    fechaNacimiento: '',
    genero: GeneroReference.MASCULINO,
    rol: '',
    estado: EstadoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    pagos: [],
  };

  editingUser: UsuarioDto | null = null;
  
  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allUsuarios: UsuarioDto[] = [
    { identifier: '1', usuario: 'pfuertes', nombres: 'Percy', apellidos: 'Fuertes Anaya', dni: '45871236', fechaNacimiento: '1976-01-15T10:00:00Z', genero: GeneroReference.MASCULINO, rol: 'Administrador', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-15T10:00:00Z', pagos: [] },
    { identifier: '2', usuario: 'emartinez', nombres: 'Emily', apellidos: 'Martinez Diaz', dni: '41257896', fechaNacimiento: '1997-12-02T10:00:00Z', genero: GeneroReference.FEMENINO, rol: 'Secretaria', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-02-01T11:30:00Z', pagos: [] }
  ];
  filteredUsuarios: UsuarioDto[] = [];
  pagedUsuarios: UsuarioDto[] = [];
  
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.generoKeys = Object.values(GeneroReference) as string[];
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    if (this.rolesDisponibles.length > 0 && !this.newUsuario.rol) {
      this.newUsuario.rol = this.rolesDisponibles[0].descripcion;
    }
    this.aplicarFiltroYPaginar();
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let usuariosTemp = [...this.allUsuarios];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    // 1. Filtrar por estado
    if (this.filtroEstado) {
      usuariosTemp = usuariosTemp.filter(user => user.estado === this.filtroEstado);
    }

    // 2. Filtrar por búsqueda de texto
    if (searchTerm) {
      usuariosTemp = usuariosTemp.filter(user => 
        user.nombres.toLowerCase().includes(searchTerm) ||
        user.apellidos.toLowerCase().includes(searchTerm) ||
        user.dni.includes(searchTerm) ||
        user.usuario.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredUsuarios = usuariosTemp;
    this.setPage(1);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.aplicarFiltroYPaginar();
  }

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;

    if (this.filteredUsuarios.length === 0) {
      this.pagedUsuarios = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredUsuarios.length);
    this.pagedUsuarios = this.filteredUsuarios.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredUsuarios.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  // --- Métodos para Añadir Usuario ---
  openAddUserModal() {
    this.newUsuario = {
      identifier: '',
      usuario: '',
      nombres: '',
      apellidos: '',
      dni: '',
      fechaNacimiento: '',
      genero: GeneroReference.MASCULINO,
      rol: this.rolesDisponibles.length > 0 ? this.rolesDisponibles[0].descripcion : '',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: new Date().toISOString(),
      pagos: [],
    };
    this.modalService.open(this.addUserModal, { centered: true, size: 'lg' });
  }

  saveUser() {
    if (!this.newUsuario.usuario || !this.newUsuario.nombres || !this.newUsuario.apellidos ||
      !this.newUsuario.dni || !this.newUsuario.fechaNacimiento || !this.newUsuario.genero ||
      !this.newUsuario.rol || !this.newUsuario.estado) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser completados.', 'error');
      return;
    }
    if (!/^\d{8}$/.test(this.newUsuario.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }

    const maxId = Math.max(...this.allUsuarios.map(u => parseInt(u.identifier || '0')), 0);
    this.newUsuario.identifier = (maxId + 1).toString();
    this.allUsuarios.push({ ...this.newUsuario });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Usuario añadido correctamente.', 'success');
    this.dismiss();
  }

  // --- Métodos para Editar Usuario ---
  openEditUserModal(usuario: UsuarioDto) {
    this.editingUser = { ...usuario };
    this.modalService.open(this.editUserModal, { centered: true, size: 'lg' });
  }

  updateUser() {
    if (!this.editingUser) { return; }
    if (!this.editingUser.usuario || !this.editingUser.nombres || !this.editingUser.apellidos ||
      !this.editingUser.dni || !this.editingUser.fechaNacimiento || !this.editingUser.genero ||
      !this.editingUser.rol || !this.editingUser.estado) {
      Swal.fire('Error', 'Todos los campos obligatorios deben ser completados para editar.', 'error');
      return;
    }
    if (!/^\d{8}$/.test(this.editingUser.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }
    const index = this.allUsuarios.findIndex(u => u.identifier === this.editingUser?.identifier);
    if (index !== -1) {
      this.allUsuarios[index] = { ...this.editingUser };
      this.aplicarFiltroYPaginar();
      Swal.fire('¡Éxito!', 'Usuario actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Usuario no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  // --- Métodos para Eliminar Usuario ---
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

  deleteUser(identifier: string) {
    const initialLength = this.allUsuarios.length;
    this.allUsuarios = this.allUsuarios.filter(usuario => usuario.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allUsuarios.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El usuario ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el usuario para eliminar.', 'error');
    }
  }

  // --- Método Genérico ---
  dismiss() {
    this.modalService.dismissAll();
  }
}