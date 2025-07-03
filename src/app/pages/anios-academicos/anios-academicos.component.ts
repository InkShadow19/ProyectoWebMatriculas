import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';

@Component({
  selector: 'app-anios-academicos',
  standalone: true, // Lo definimos como standalone
  imports: [
    CommonModule,   // Necesario para *ngFor y ngClass
    SharedModule,   // Necesario para los íconos <app-keenicon>
  ],
  templateUrl: './anios-academicos.component.html',
  styleUrl: './anios-academicos.component.scss'
})
export class AniosAcademicosComponent implements OnInit {

  // Hacemos el enum accesible desde la plantilla HTML
  EstadoAcademicoReference = EstadoAcademicoReference;

  // Datos ficticios para la tabla de años académicos
  aniosAcademicos: AnioAcademicoDto[] = [
    {
      identifier: '1',
      anio: 2023,
      estado: EstadoAcademicoReference.CERRADO,
      habilitado: false,
      fechaCreacion: '2023-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '2',
      anio: 2024,
      estado: EstadoAcademicoReference.CERRADO,
      habilitado: true,
      fechaCreacion: '2024-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '3',
      anio: 2025,
      estado: EstadoAcademicoReference.ACTIVO,
      habilitado: true,
      fechaCreacion: '2025-01-15T09:00:00Z',
      matriculas: [],
    },
    {
      identifier: '4',
      anio: 2026,
      estado: EstadoAcademicoReference.FUTURO,
      habilitado: true,
      fechaCreacion: '2025-07-01T11:00:00Z',
      matriculas: [],
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  toggleHabilitado(anio: AnioAcademicoDto) {
    // 1. Lógica para cambiar el estado en el frontend
    anio.habilitado = !anio.habilitado;

    // 2. Aquí iría tu llamada al backend para guardar el cambio
    //    Ej: this.anioAcademicoService.actualizarEstado(anio.identifier, anio.habilitado).subscribe(...)

    // 3. Mostramos en consola para verificar que funciona
    console.log(`Cambiando estado de ${anio.anio}. Nuevo estado: ${anio.habilitado}`);
  }
}