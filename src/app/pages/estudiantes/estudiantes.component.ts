import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';
import { NgbModal, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    NgbDropdownModule
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss'
})
export class EstudiantesComponent implements OnInit {
  @ViewChild('addEstudianteModal') addEstudianteModal: TemplateRef<any>;
  @ViewChild('editEstudianteModal') editEstudianteModal: TemplateRef<any>;

  GeneroReference = GeneroReference;
  EstadoAcademicoReference = EstadoAcademicoReference;

  generoKeys: string[];
  estadoEstudianteKeys: string[];

  newEstudiante: EstudianteDto = {
    identifier: '',
    dni: '',
    nombre: '',
    apellidoPaterno: '',
    apellidoMaterno: '',
    fechaNacimiento: '',
    genero: GeneroReference.MASCULINO,
    email: '',
    telefono: '',
    direccion: '',
    estado: EstadoAcademicoReference.ACTIVO,
    fechaCreacion: new Date().toISOString(),
    matriculas: [],
  };

  editingEstudiante: EstudianteDto | null = null;
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  allEstudiantes: EstudianteDto[] = [
    { identifier: '1', dni: '78945612', nombre: 'Carlos', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', fechaNacimiento: '2010-05-15', genero: GeneroReference.MASCULINO, direccion: 'Av. Los Proceres 123, Surco', telefono: '987654321', email: 'carlos.vargas@email.com', estado: EstadoAcademicoReference.ACTIVO, fechaCreacion: '2024-01-20T10:00:00Z', matriculas: [] },
    { identifier: '2', dni: '71234567', nombre: 'Ana', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', fechaNacimiento: '2011-08-22', genero: GeneroReference.FEMENINO, direccion: 'Jr. de la Union 456, Lima', telefono: '912345678', email: 'ana.ruiz@email.com', estado: EstadoAcademicoReference.ACTIVO, fechaCreacion: '2024-01-22T11:30:00Z', matriculas: [] },
    { identifier: '3', dni: '75689123', nombre: 'Pedro', apellidoPaterno: 'Gomez', apellidoMaterno: 'Perez', fechaNacimiento: '2010-03-10', genero: GeneroReference.MASCULINO, direccion: 'Calle Las Begonias 789, San Isidro', telefono: '998877665', email: 'pedro.gomez@email.com', estado: EstadoAcademicoReference.RETIRADO, fechaCreacion: '2023-11-05T14:00:00Z', matriculas: [] },
    { identifier: '4', dni: '71122334', nombre: 'Camila', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva', fechaNacimiento: '2012-12-01', genero: GeneroReference.FEMENINO, direccion: 'Jr. Huiracocha 2050, Jesus Maria', telefono: '911223344', email: 'camila.castro@email.com', estado: EstadoAcademicoReference.EGRESADO, fechaCreacion: '2024-02-15T10:00:00Z', matriculas: [] },
  ];
  filteredEstudiantes: EstudianteDto[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pagedEstudiantes: EstudianteDto[] = [];

  constructor(private cdr: ChangeDetectorRef, private modalService: NgbModal) {
    this.generoKeys = Object.values(GeneroReference) as string[];

    this.estadoEstudianteKeys = [
      EstadoAcademicoReference.ACTIVO,
      EstadoAcademicoReference.RETIRADO,
      EstadoAcademicoReference.EGRESADO,
      EstadoAcademicoReference.UNDEFINED
    ];
  }

  ngOnInit(): void {
    this.aplicarFiltroYPaginar();
  }

  aplicarFiltroYPaginar(): void {
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();
    let estudiantesTemp = [...this.allEstudiantes];

    if (this.filtroEstado) {
      estudiantesTemp = estudiantesTemp.filter(estudiante => estudiante.estado === this.filtroEstado);
    }

    if (searchTerm) {
      estudiantesTemp = estudiantesTemp.filter(estudiante => {
        const nombreCompleto = `${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno || ''}`.toLowerCase();
        return nombreCompleto.includes(searchTerm) || estudiante.dni.includes(searchTerm);
      });
    }

    this.filteredEstudiantes = estudiantesTemp;
    this.setPage(1);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.aplicarFiltroYPaginar();
  }

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1) {
      page = 1;
    }
    if (page > totalPages) {
      page = totalPages;
    }
    this.currentPage = page;

    if (this.filteredEstudiantes.length === 0) {
      this.pagedEstudiantes = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredEstudiantes.length);
    this.pagedEstudiantes = this.filteredEstudiantes.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredEstudiantes.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array(this.getTotalPages()).fill(0).map((x, i) => i + 1);
  }

  openAddEstudianteModal() {
    this.newEstudiante = {
      identifier: '',
      dni: '',
      nombre: '',
      apellidoPaterno: '',
      apellidoMaterno: '',
      fechaNacimiento: '',
      genero: GeneroReference.MASCULINO,
      email: '',
      telefono: '',
      direccion: '',
      estado: EstadoAcademicoReference.ACTIVO,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addEstudianteModal, { centered: true, size: 'lg' });
  }

  saveEstudiante() {
    if (!this.newEstudiante.dni || !this.newEstudiante.nombre || !this.newEstudiante.apellidoPaterno || !this.newEstudiante.fechaNacimiento || !this.newEstudiante.genero || !this.newEstudiante.email || !this.newEstudiante.estado) {
      Swal.fire('Error', 'Los campos requeridos deben ser completados.', 'error');
      return;
    }
    if (!/^\d{8}$/.test(this.newEstudiante.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.newEstudiante.email)) {
      Swal.fire('Error', 'El formato del email no es válido.', 'error');
      return;
    }

    const maxId = Math.max(...this.allEstudiantes.map(e => parseInt(e.identifier || '0')), 0);
    this.newEstudiante.identifier = (maxId + 1).toString();
    this.allEstudiantes.push({ ...this.newEstudiante });
    this.aplicarFiltroYPaginar();
    Swal.fire('¡Éxito!', 'Estudiante añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditEstudianteModal(estudiante: EstudianteDto) {
    this.editingEstudiante = { ...estudiante };
    this.modalService.open(this.editEstudianteModal, { centered: true, size: 'lg' });
  }

  updateEstudiante() {
    if (!this.editingEstudiante) {
      Swal.fire('Error', 'No hay estudiante seleccionado para editar.', 'error');
      return;
    }
    if (!this.editingEstudiante.dni || !this.editingEstudiante.nombre || !this.editingEstudiante.apellidoPaterno || !this.editingEstudiante.fechaNacimiento || !this.editingEstudiante.genero || !this.editingEstudiante.email || !this.editingEstudiante.estado) {
      Swal.fire('Error', 'Los campos requeridos deben ser completados.', 'error');
      return;
    }
    if (!/^\d{8}$/.test(this.editingEstudiante.dni)) {
      Swal.fire('Error', 'El DNI debe contener exactamente 8 dígitos numéricos.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.editingEstudiante.email)) {
      Swal.fire('Error', 'El formato del email no es válido.', 'error');
      return;
    }

    const index = this.allEstudiantes.findIndex(e => e.identifier === this.editingEstudiante?.identifier);
    if (index !== -1) {
      this.allEstudiantes[index] = { ...this.editingEstudiante };
      this.aplicarFiltroYPaginar();
      Swal.fire('¡Éxito!', 'Estudiante actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Estudiante no encontrado para actualizar.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteEstudiante(estudiante: EstudianteDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás a ${estudiante.nombre} ${estudiante.apellidoPaterno}`,
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

  deleteEstudiante(identifier: string) {
    const initialLength = this.allEstudiantes.length;
    this.allEstudiantes = this.allEstudiantes.filter(estudiante => estudiante.identifier !== identifier);
    this.aplicarFiltroYPaginar();
    if (this.allEstudiantes.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El estudiante ha sido eliminado.', 'success');
    } else {
      Swal.fire('Error', 'No se pudo encontrar el estudiante para eliminar.', 'error');
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}