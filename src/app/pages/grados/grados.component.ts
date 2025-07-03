import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { GradoDto } from 'src/app/models/grado.model';

@Component({
  selector: 'app-grados',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './grados.component.html',
  styleUrl: './grados.component.scss'
})
export class GradosComponent implements OnInit {
  
  grados: GradoDto[] = [
    // --- Nivel Inicial ---
    { identifier: '1', descripcion: '3 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '2', descripcion: '4 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '3', descripcion: '5 Años', nivel: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    // --- Nivel Primaria ---
    { identifier: '4', descripcion: 'Primer Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '5', descripcion: 'Segundo Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '6', descripcion: 'Tercer Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '7', descripcion: 'Cuarto Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '8', descripcion: 'Quinto Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '9', descripcion: 'Sexto Grado', nivel: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    // --- Nivel Secundaria ---
    { identifier: '10', descripcion: 'Primer Año', nivel: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '11', descripcion: 'Segundo Año', nivel: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '12', descripcion: 'Tercer Año', nivel: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '13', descripcion: 'Cuarto Año', nivel: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
    { identifier: '14', descripcion: 'Quinto Año', nivel: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', matriculas: [] },
  ];;

  constructor() {}

  ngOnInit(): void {}

  toggleHabilitado(grado: GradoDto) {
    grado.habilitado = !grado.habilitado;
  }
}
