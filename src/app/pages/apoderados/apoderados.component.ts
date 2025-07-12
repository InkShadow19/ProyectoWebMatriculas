import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum'; // <--- IMPORTADO

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
  EstadoReference = EstadoReference; // <--- AÑADIDO
  generoKeys: string[];
  estadoKeys: string[]; // <--- AÑADIDO

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
    estado: EstadoReference.ACTIVO, // <--- CAMBIADO
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };

  editingApoderado: ApoderadoDto | null = null;
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pagedApoderados: ApoderadoDto[] = [];

  apoderados: ApoderadoDto[] = [
    { identifier: '1', dni: '45678912', nombre: 'Maria', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', parentesco: 'Madre', fechaNacimiento: '1985-02-20', genero: GeneroReference.FEMENINO, telefono: '987654321', email: 'maria.vargas@email.com', direccion: 'Av. Los Proceres 123, Surco', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-20T09:00:00Z', matriculas: [] },
    { identifier: '2', dni: '41234567', nombre: 'Juan', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', parentesco: 'Padre', fechaNacimiento: '1982-11-30', genero: GeneroReference.MASCULINO, telefono: '912345678', email: 'juan.ruiz@email.com', direccion: 'Jr. de la Union 456, Lima', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-22T11:00:00Z', matriculas: [] },
    { identifier: '5', dni: '40123456', nombre: 'Carmen', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', parentesco: 'Abuela', fechaNacimiento: '1965-12-25', genero: GeneroReference.FEMENINO, telefono: '987123456', email: 'carmen.quispe@email.com', direccion: 'Urb. Santa Patricia, La Molina', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-02-05T12:05:00Z', matriculas: [] },
  ];

  constructor(private cdr: ChangeDetectorRef, private modalService: NgbModal) {
    this.generoKeys = Object.values(GeneroReference) as string[];
    this.estadoKeys = Object.values(EstadoReference) as string[]; // <--- AÑADIDO
  }

  ngOnInit(): void {
    this.setPage(1);
  }

  // ELIMINADO: El método toggleHabilitado() ya no es necesario.

  // --- Métodos de Paginación ---
  setPage(page: number) {
    if (page < 1 || page > this.getTotalPages()) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.apoderados.length);
    this.pagedApoderados = this.apoderados.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.apoderados.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
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
      estado: EstadoReference.ACTIVO, // <--- CAMBIADO
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addApoderadoModal, { centered: true, size: 'lg' });
  }

  saveApoderado() {
    if (!this.newApoderado.dni || !this.newApoderado.nombre || !this.newApoderado.apellidoPaterno ||
      !this.newApoderado.parentesco || !this.newApoderado.fechaNacimiento || !this.newApoderado.genero ||
      !this.newApoderado.email || !this.newApoderado.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }
    // ... resto de validaciones ...
    const maxId = Math.max(...this.apoderados.map(a => parseInt(a.identifier || '0')), 0);
    this.newApoderado.identifier = (maxId + 1).toString();
    this.apoderados.push({ ...this.newApoderado });
    this.setPage(this.getTotalPages());
    Swal.fire('¡Éxito!', 'Apoderado añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditApoderadoModal(apoderado: ApoderadoDto) {
    this.editingApoderado = { ...apoderado };
    this.modalService.open(this.editApoderadoModal, { centered: true, size: 'lg' });
  }

  updateApoderado() {
    if (!this.editingApoderado) { /* ... */ return; }
    if (!this.editingApoderado.dni || !this.editingApoderado.nombre || !this.editingApoderado.apellidoPaterno ||
      !this.editingApoderado.parentesco || !this.editingApoderado.fechaNacimiento || !this.editingApoderado.genero ||
      !this.editingApoderado.email || !this.editingApoderado.estado) { // <--- VALIDACIÓN ACTUALIZADA
      Swal.fire('Error', 'Todos los campos requeridos deben ser completados.', 'error');
      return;
    }
    // ... resto de validaciones ...
    const index = this.apoderados.findIndex(a => a.identifier === this.editingApoderado?.identifier);
    if (index !== -1) {
      this.apoderados[index] = { ...this.editingApoderado };
      this.setPage(this.currentPage);
      Swal.fire('¡Éxito!', 'Apoderado actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Apoderado no encontrado para actualizar.', 'error');
    }
    this.dismiss();
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

  /**
   * Elimina un apoderado de la lista y actualiza la paginación correctamente.
   * @param identifier El identificador del apoderado a eliminar.
   */
  deleteApoderado(identifier: string) {
    const initialLength = this.apoderados.length;
    this.apoderados = this.apoderados.filter(apoderado => apoderado.identifier !== identifier);
    const totalPages = this.getTotalPages();

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    if (totalPages === 0) {
      this.pagedApoderados = [];
      this.currentPage = 1;
    } else {
      this.setPage(this.currentPage);
    }

    if (this.apoderados.length < initialLength) {
      Swal.fire(
        '¡Eliminado!',
        'El apoderado ha sido eliminado.',
        'success'
      );
      console.log(`Apoderado con ID ${identifier} eliminado.`);
    } else {
      Swal.fire(
        'Error',
        'No se pudo encontrar el apoderado para eliminar.',
        'error'
      );
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}