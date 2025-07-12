import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { EstadoReference } from 'src/app/models/enums/estado-reference.enum';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.scss',
})
export class GradosComponent implements OnInit {
  @ViewChild('addGradoModal') addGradoModal: TemplateRef<any>;
  @ViewChild('editGradoModal') editGradoModal: TemplateRef<any>;

  EstadoReference = EstadoReference;
  estadoKeys: string[];
  nivelesDisponibles: string[] = [];

  newGrado: GradoDto = { identifier: '', descripcion: '', nivel: '', estado: EstadoReference.ACTIVO, fechaCreacion: '', matriculas: [] };
  editingGrado: GradoDto | null = null;
  
  // --- ESTRUCTURA DE DATOS CORRECTA ---
  allGrados: GradoDto[] = [
    { identifier: '1', descripcion: '3 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '2', descripcion: '4 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '3', descripcion: '5 Años', nivel: 'Inicial', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '4', descripcion: '1er Grado', nivel: 'Primaria', estado: EstadoReference.INACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '5', descripcion: '2do Grado', nivel: 'Primaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '6', descripcion: '1er Año', nivel: 'Secundaria', estado: EstadoReference.ACTIVO, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
  ];
  filteredGrados: GradoDto[] = [];
  pagedGrados: GradoDto[] = [];
  
  filtroBusqueda: string = '';
  filtroEstado: string = '';
  filtroNivel: string = '';
  currentPage = 1;
  itemsPerPage = 5;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) {
    this.estadoKeys = Object.values(EstadoReference) as string[];
  }

  ngOnInit(): void {
    this.actualizarNivelesDisponibles();
    this.aplicarFiltroYPaginar();
  }

  // --- MÉTODOS DE FILTRO Y PAGINACIÓN (Correctos) ---
  aplicarFiltroYPaginar(): void {
    let gradosTemp = [...this.allGrados];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();

    if (this.filtroNivel) {
      gradosTemp = gradosTemp.filter(grado => grado.nivel === this.filtroNivel);
    }
    
    if (this.filtroEstado) {
      gradosTemp = gradosTemp.filter(grado => grado.estado === this.filtroEstado);
    }

    if (searchTerm) {
      gradosTemp = gradosTemp.filter(grado =>
        grado.descripcion.toLowerCase().includes(searchTerm)
      );
    }

    this.filteredGrados = gradosTemp;
    this.setPage(1);
  }

  limpiarFiltros(): void {
    this.filtroBusqueda = '';
    this.filtroEstado = '';
    this.filtroNivel = '';
    this.aplicarFiltroYPaginar();
  }

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    this.currentPage = page;

    if (this.filteredGrados.length === 0) {
      this.pagedGrados = [];
      return;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredGrados.length);
    this.pagedGrados = this.filteredGrados.slice(startIndex, endIndex);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredGrados.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i + 1);
  }

  actualizarNivelesDisponibles() {
    this.nivelesDisponibles = [...new Set(this.allGrados.map(g => g.nivel))];
  }

  // --- MÉTODOS CRUD ---
  openAddGradoModal() {
    this.newGrado = { identifier: '', descripcion: '', nivel: '', estado: EstadoReference.ACTIVO, fechaCreacion: new Date().toISOString(), matriculas: [] };
    this.modalService.open(this.addGradoModal, { centered: true, size: 'lg' });
  }

  saveGrado() {
    if (!this.newGrado.descripcion || !this.newGrado.nivel || !this.newGrado.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    const maxId = Math.max(...this.allGrados.map(g => parseInt(g.identifier || '0')), 0);
    this.newGrado.identifier = (maxId + 1).toString();
    
    // 1. MODIFICAR la lista principal
    this.allGrados.push({ ...this.newGrado });
    
    // 2. ACTUALIZAR la lista de niveles disponibles
    this.actualizarNivelesDisponibles();

    // 3. RE-APLICAR filtros y paginación para refrescar la vista
    this.aplicarFiltroYPaginar();

    Swal.fire('¡Éxito!', 'Grado añadido correctamente.', 'success');
    this.dismiss();
  }

  openEditGradoModal(grado: GradoDto) {
    this.editingGrado = { ...grado };
    this.modalService.open(this.editGradoModal, { centered: true, size: 'lg' });
  }

  updateGrado() {
    if (!this.editingGrado || !this.editingGrado.descripcion || !this.editingGrado.nivel || !this.editingGrado.estado) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }
    
    // 1. ENCONTRAR Y MODIFICAR en la lista principal
    const index = this.allGrados.findIndex(g => g.identifier === this.editingGrado!.identifier);
    if (index !== -1) {
      this.allGrados[index] = { ...this.editingGrado! };
      
      // 2. ACTUALIZAR la lista de niveles disponibles
      this.actualizarNivelesDisponibles();
      
      // 3. RE-APLICAR filtros y paginación para refrescar la vista
      this.aplicarFiltroYPaginar();

      Swal.fire('¡Éxito!', 'Grado actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Grado no encontrado.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteGrado(grado: GradoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el grado: ${grado.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, ¡eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGrado(grado.identifier || '');
      }
    });
  }

  deleteGrado(identifier: string) {
    const initialLength = this.allGrados.length;
    
    // 1. MODIFICAR la lista principal
    this.allGrados = this.allGrados.filter(n => n.identifier !== identifier);

    // 2. ACTUALIZAR la lista de niveles disponibles
    this.actualizarNivelesDisponibles();
    
    // 3. RE-APLICAR filtros y paginación para refrescar la vista
    this.aplicarFiltroYPaginar();

    if (this.allGrados.length < initialLength) {
      Swal.fire('¡Eliminado!','El grado ha sido eliminado.','success');
    } else {
      Swal.fire('Error','No se pudo encontrar el grado para eliminar.','error');
    }
  }

  dismiss() {
    this.modalService.dismissAll();
  }
}