import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';
import { ApoderadoService } from 'src/app/services/apoderado.service';
import { ApoderadoDomainService } from 'src/app/domains/apoderado-domain.service';

@Component({
  selector: 'app-apoderados',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './apoderados.component.html',
  styleUrl: './apoderados.component.scss'
})
export class ApoderadosComponent implements OnInit {
  @ViewChild('addApoderadoModal') addApoderadoModal: TemplateRef<any>;
  @ViewChild('editApoderadoModal') editApoderadoModal: TemplateRef<any>;

  GeneroReference = GeneroReference;
  EstadoReference = EstadoReference;
  generoKeys: string[];
  estadoKeys: string[];

  newApoderado: ApoderadoDto = {
    identifier: '',
    dni: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    parentesco: '',
    fechaNacimiento: '',
    genero: GeneroReference.MASCULINO,
    email: '',
    telefono: '',
    direccion: '',
    estado: EstadoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };
  editingApoderado: ApoderadoDto | null = null;

  // --- PROPIEDADES PARA FILTROS Y PAGINACIÓN ---
  allApoderados: ApoderadoDto[] = [
    { identifier: '1', dni: '45678912', nombre: 'Maria', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', parentesco: 'Madre', fechaNacimiento: '1985-02-20', genero: GeneroReference.FEMENINO, telefono: '987654321', email: 'maria.vargas@email.com', direccion: 'Av. Los Proceres 123, Surco', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-20T09:00:00Z', matriculas: [] },
    { identifier: '2', dni: '41234567', nombre: 'Juan', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', parentesco: 'Padre', fechaNacimiento: '1982-11-30', genero: GeneroReference.MASCULINO, telefono: '912345678', email: 'juan.ruiz@email.com', direccion: 'Jr. de la Union 456, Lima', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-22T11:00:00Z', matriculas: [] },
    { identifier: '5', dni: '40123456', nombre: 'Carmen', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', parentesco: 'Abuela', fechaNacimiento: '1965-12-25', genero: GeneroReference.FEMENINO, telefono: '987123456', email: 'carmen.quispe@email.com', direccion: 'Urb. Santa Patricia, La Molina', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-02-05T12:05:00Z', matriculas: [] },
  ];
  filteredApoderados: ApoderadoDto[] = []; // Almacena los apoderados después de aplicar filtros
  pagedApoderados: ApoderadoDto[] = []; // Almacena los apoderados de la página actual

  filtroBusqueda: string = '';
  filtroEstado: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;

  constructor(private cdr: ChangeDetectorRef, private modalService: NgbModal, private apoderadoService: ApoderadoDomainService) {
    this.generoKeys = Object.values(GeneroReference) as string[];
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    //this.aplicarFiltroYPaginar(); // Carga inicial
    this.cargarApoderadosDesdeApi();
  }

  cargarApoderadosDesdeApi(): void {
    this.apoderadoService.getList(0, 100).subscribe(response => {
      if (response && response.content) {
        this.allApoderados = response.content;
        this.aplicarFiltroYPaginar();
      } else {
        this.allApoderados = [];
      }
    });
  }

  // --- Métodos de Filtro y Paginación ---
  aplicarFiltroYPaginar(): void {
    let apoderadosTemp = [...this.allApoderados];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    // 1. Filtrar por estado
    if (this.filtroEstado) {
      apoderadosTemp = apoderadosTemp.filter(apoderado => apoderado.estado === this.filtroEstado);
    }

    // 2. Filtrar por búsqueda de texto
    if (searchTerm) {
      apoderadosTemp = apoderadosTemp.filter(apoderado => {
        const nombreCompleto = `${apoderado.nombre} ${apoderado.apellidoPaterno} ${apoderado.apellidoMaterno || ''}`.toLowerCase();
        return nombreCompleto.includes(searchTerm) || apoderado.dni.includes(searchTerm);
      });
    }

    this.filteredApoderados = apoderadosTemp;
    this.setPage(1); // Siempre vuelve a la primera página después de un nuevo filtro
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

    if (this.filteredApoderados.length === 0) {
      this.pagedApoderados = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredApoderados.length);
    this.pagedApoderados = this.filteredApoderados.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredApoderados.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array(this.getTotalPages()).fill(0).map((x, i) => i + 1);
  }

  // --- Métodos CRUD ---
  openAddApoderadoModal() {
    this.newApoderado = {
      identifier: '',
      dni: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      parentesco: '',
      fechaNacimiento: '',
      genero: GeneroReference.MASCULINO,
      email: '',
      telefono: '',
      direccion: '',
      estado: EstadoReference.ACTIVO,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addApoderadoModal, { centered: true, size: 'lg' });
  }

  /*saveApoderado() {
    if (!this.newApoderado.dni || !this.newApoderado.nombre || !this.newApoderado.apellidoPaterno ||
      !this.newApoderado.parentesco || !this.newApoderado.fechaNacimiento || !this.newApoderado.genero ||
      !this.newApoderado.email || !this.newApoderado.estado) {
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }
    const maxId = Math.max(...this.allApoderados.map(a => parseInt(a.identifier || '0')), 0);
    this.newApoderado.identifier = (maxId + 1).toString();
    this.allApoderados.push({ ...this.newApoderado });
    this.aplicarFiltroYPaginar(); // Actualiza la vista
    Swal.fire('¡Éxito!', 'Apoderado añadido correctamente.', 'success');
    this.dismiss();
  }*/

  saveApoderado() {
    if (!this.newApoderado.dni || !this.newApoderado.nombre || !this.newApoderado.apellidoPaterno ||
      !this.newApoderado.parentesco || !this.newApoderado.fechaNacimiento || !this.newApoderado.genero ||
      !this.newApoderado.email || !this.newApoderado.estado) {
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }

    this.apoderadoService.add(this.newApoderado).subscribe((apoderadoAgregado) => {
      if (apoderadoAgregado) {
        console.log("Se agregó correctamente:", apoderadoAgregado);
        this.allApoderados.push(apoderadoAgregado);
        this.aplicarFiltroYPaginar();
        this.modalService.dismissAll();
        Swal.fire('¡Éxito!', 'Apoderado añadido correctamente.', 'success');
      } else {
        Swal.fire('Error', 'No se pudo agregar el apoderado.', 'error');
      }
    });
  }

  openEditApoderadoModal(apoderado: ApoderadoDto) {
    this.editingApoderado = { ...apoderado };
    this.modalService.open(this.editApoderadoModal, { centered: true, size: 'lg' });
  }

  /*updateApoderado() {
    if (!this.editingApoderado) { return; }
    if (!this.editingApoderado.dni || !this.editingApoderado.nombre || !this.editingApoderado.apellidoPaterno ||
      !this.editingApoderado.parentesco || !this.editingApoderado.fechaNacimiento || !this.editingApoderado.genero ||
      !this.editingApoderado.email || !this.editingApoderado.estado) {
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }
    const index = this.allApoderados.findIndex(a => a.identifier === this.editingApoderado?.identifier);
    if (index !== -1) {
      this.allApoderados[index] = { ...this.editingApoderado };
      this.aplicarFiltroYPaginar(); // Actualiza la vista
      Swal.fire('¡Éxito!', 'Apoderado actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Apoderado no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }*/

  updateApoderado() {
    if (!this.editingApoderado) { return; }

    if (!this.editingApoderado.dni || !this.editingApoderado.nombre || !this.editingApoderado.apellidoPaterno ||
      !this.editingApoderado.parentesco || !this.editingApoderado.fechaNacimiento || !this.editingApoderado.genero ||
      !this.editingApoderado.email || !this.editingApoderado.estado) {
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }

    this.apoderadoService.update(this.editingApoderado.identifier!, this.editingApoderado).subscribe({
      next: (updated) => {
        const index = this.allApoderados.findIndex(a => a.identifier === updated.identifier);
        if (index !== -1) {
          this.allApoderados[index] = updated;
          this.aplicarFiltroYPaginar();
          Swal.fire('¡Éxito!', 'Apoderado actualizado correctamente.', 'success');
        }
        this.dismiss();
      },
      error: () => {
        Swal.fire('Error', 'Hubo un problema al actualizar el apoderado.', 'error');
      }
    });
  }

  confirmDeleteApoderado(apoderado: ApoderadoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás al apoderado: ${apoderado.nombre} ${apoderado.apellidoPaterno}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteApoderado(apoderado.identifier || '');
      }
    });
  }

  /*deleteApoderado(identifier: string) {
    const initialLength = this.allApoderados.length;
    this.allApoderados = this.allApoderados.filter(apoderado => apoderado.identifier !== identifier);
    this.aplicarFiltroYPaginar(); // Actualiza la vista
    if (this.allApoderados.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El apoderado ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el apoderado para eliminar.', 'error');
    }
  }*/

  deleteApoderado(identifier: string) {
    this.apoderadoService.delete(identifier).subscribe({
      next: () => {
        this.allApoderados = this.allApoderados.filter(apoderado => apoderado.identifier !== identifier);
        this.aplicarFiltroYPaginar();
        Swal.fire('¡Eliminado!', 'El apoderado ha sido eliminado.', 'success');
      },
      error: () => {
        Swal.fire('Error', 'No se pudo eliminar el apoderado.', 'error');
      }
    });
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}