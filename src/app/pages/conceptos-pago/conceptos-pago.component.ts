import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConceptoPagoDto } from 'src/app/models/concepto-pago.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';

@Component({
  selector: 'app-conceptos-pago',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
  ],
  templateUrl: './conceptos-pago.component.html',
  styleUrl: './conceptos-pago.component.scss'
})
export class ConceptosPagoComponent implements OnInit {

  // Datos ficticios actualizados con solo los 2 conceptos base.
  conceptosDePago: ConceptoPagoDto[] = [
    {
      identifier: '1',
      codigo: 'MATR',
      descripcion: 'Matrícula',
      montoSugerido: 280.00,
      habilitado: true,
      fechaCreacion: '2024-01-10T10:00:00Z',
      cronogramas: [],
    },
    {
      identifier: '2',
      codigo: 'PENS',
      descripcion: 'Pensión Mensual',
      montoSugerido: 300.00,
      habilitado: true,
      fechaCreacion: '2024-01-11T11:00:00Z',
      cronogramas: [],
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleHabilitado(concepto: any) {
    concepto.habilitado = !concepto.habilitado;
    console.log(`Cambiando estado de ${concepto.descripcion}. Nuevo estado: ${concepto.habilitado}`);
    // Aquí irá la llamada al servicio para guardar el cambio en la base de datos
  }
}