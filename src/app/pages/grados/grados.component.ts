import { Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

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

  grados: GradoDto[] = [
    { identifier: '1', descripcion: '3 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '2', descripcion: '4 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '3', descripcion: '5 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    // ...
  ];

  newGrado: GradoDto = { identifier: '', descripcion: '', nivel: '', habilitado: true, fechaCreacion: '', matriculas: [] };
  editingGrado: GradoDto | null = null;

  constructor(private modalService: NgbModal, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void { }

  toggleHabilitado(grado: GradoDto) {
    grado.habilitado = !grado.habilitado;
  }

  openAddGradoModal() {
    this.newGrado = {
      identifier: '',
      descripcion: '',
      nivel: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      matriculas: [],
    };
    this.modalService.open(this.addGradoModal, { centered: true, size: 'lg' });
  }

  openEditGradoModal(grado: GradoDto) {
    this.editingGrado = { ...grado };
    this.modalService.open(this.editGradoModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveGrado() {
    if (!this.newGrado.descripcion || !this.newGrado.nivel) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    this.newGrado.identifier = (Math.max(...this.grados.map(g => parseInt(g.identifier)), 0) + 1).toString();
    this.grados.push({ ...this.newGrado });
    Swal.fire('¡Éxito!', 'Grado añadido correctamente.', 'success');
    this.dismiss();
  }

  updateGrado() {
    if (!this.editingGrado || !this.editingGrado.descripcion || !this.editingGrado.nivel) {
      Swal.fire('Error', 'Todos los campos son obligatorios.', 'error');
      return;
    }

    const index = this.grados.findIndex(g => g.identifier === this.editingGrado!.identifier);
    if (index !== -1) {
      this.grados[index] = { ...this.editingGrado! };
      Swal.fire('¡Éxito!', 'Grado actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Grado no encontrado.', 'error');
    }
    this.dismiss();
  }

  deleteGrado(identifier: string) {
    const initialLength = this.grados.length;
    this.grados = this.grados.filter(grado => grado.identifier !== identifier);

    console.log(`Intentando eliminar grado con ID: ${identifier}`);
    console.log('Estado del array "grados" DESPUÉS del filtro:', this.grados);

    if (this.grados.length < initialLength) {
      Swal.fire('¡Eliminado!', 'El grado ha sido eliminado.', 'success');
      this.cdr.detectChanges(); // Esto fuerza la actualización del DOM
    } else {
      Swal.fire('Error', 'No se pudo encontrar el grado para eliminar.', 'error');
    }
  }


  confirmDeleteGrado(grado: GradoDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¡No podrás revertir esto! Eliminarás el grado: ${grado.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteGrado(grado.identifier || '');
      }
    });
  }

}
