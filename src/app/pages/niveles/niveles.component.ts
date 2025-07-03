import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { NivelDto } from 'src/app/models/nivel.model';

@Component({
  selector: 'app-niveles',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './niveles.component.html',
  styleUrl: './niveles.component.scss'
})
export class NivelesComponent implements OnInit {
  
  niveles: NivelDto[] = [
    { identifier: '1', descripcion: 'Inicial', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '2', descripcion: 'Primaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
    { identifier: '3', descripcion: 'Secundaria', habilitado: true, fechaCreacion: '2024-01-01T08:00:00Z', grados: [], matriculas: [] },
  ];

  constructor() {}

  ngOnInit(): void {}

  toggleHabilitado(nivel: NivelDto) {
    nivel.habilitado = !nivel.habilitado;
  }
}
