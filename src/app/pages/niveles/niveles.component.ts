import {
  Component, OnInit, ViewChild, TemplateRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';
import { NgbDropdownModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, NgbDropdownModule],
  templateUrl: './niveles.component.html',
  styleUrl: './niveles.component.scss',
})
export class NivelesComponent implements OnInit {
  @ViewChild('addNivelModal') addNivelModal: TemplateRef<any>;
  @ViewChild('editNivelModal') editNivelModal: TemplateRef<any>;

  niveles: NivelDto[] = [
    { identifier: '1', descripcion: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '2', descripcion: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '3', descripcion: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
  ];

  newNivel: NivelDto = { identifier: '', descripcion: '', habilitado: true, fechaCreacion: '', grados: [], matriculas: [] };
  editingNivel: NivelDto | null = null;

  constructor(private modalService: NgbModal) {}

  ngOnInit(): void {}

  toggleHabilitado(nivel: NivelDto) {
    nivel.habilitado = !nivel.habilitado;
  }

  openAddNivelModal() {
    this.newNivel = {
      identifier: '',
      descripcion: '',
      habilitado: true,
      fechaCreacion: new Date().toISOString(),
      grados: [],
      matriculas: [],
    };
    this.modalService.open(this.addNivelModal, { centered: true, size: 'lg' });
  }

  openEditNivelModal(nivel: NivelDto) {
    this.editingNivel = { ...nivel };
    this.modalService.open(this.editNivelModal, { centered: true, size: 'lg' });
  }

  dismiss() {
    this.modalService.dismissAll();
  }

  saveNivel() {
    if (!this.newNivel.descripcion) {
      Swal.fire('Error', 'La descripción es obligatoria.', 'error');
      return;
    }
    this.newNivel.identifier = (Math.max(...this.niveles.map(n => parseInt(n.identifier)), 0) + 1).toString();
    this.niveles.push({ ...this.newNivel });
    Swal.fire('¡Éxito!', 'Nivel añadido correctamente.', 'success');
    this.dismiss();
  }

  updateNivel() {
    if (!this.editingNivel || !this.editingNivel.descripcion) {
      Swal.fire('Error', 'La descripción es obligatoria.', 'error');
      return;
    }

    const index = this.niveles.findIndex(n => n.identifier === this.editingNivel!.identifier);
    if (index !== -1) {
      this.niveles[index] = { ...this.editingNivel! };
      Swal.fire('¡Éxito!', 'Nivel actualizado correctamente.', 'success');
    } else {
      Swal.fire('Error', 'Nivel no encontrado.', 'error');
    }
    this.dismiss();
  }

  confirmDeleteNivel(nivel: NivelDto) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Eliminarás el nivel: ${nivel.descripcion}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.niveles = this.niveles.filter(n => n.identifier !== nivel.identifier);
        Swal.fire('Eliminado', 'Nivel eliminado correctamente.', 'success');
      }
    });
  }
}
