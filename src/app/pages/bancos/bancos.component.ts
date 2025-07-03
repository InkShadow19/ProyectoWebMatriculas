import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // <-- 1. Importar CommonModule
import { BancoDto } from 'src/app/models/banco.model';
import { SharedModule } from 'src/app/_metronic/shared/shared.module'; // <-- 1. Cambia la importación

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [
    CommonModule, // <-- 3. Añadir CommonModule aquí
    SharedModule, // <-- 4. Añadir SharedModule aquí
  ],
  templateUrl: './bancos.component.html',
  styleUrl: './bancos.component.scss'
})
export class BancosComponent implements OnInit {
  // Datos ficticios para la tabla de bancos
  bancos: BancoDto[] = [
    {
      identifier: '1',
      codigo: 'BCP',
      descripcion: 'Banco de Crédito del Perú',
      habilitado: true,
      fechaCreacion: '2023-01-15T09:00:00Z',
      pagos: [],
    },
    {
      identifier: '2',
      codigo: 'IBK',
      descripcion: 'Interbank',
      habilitado: true,
      fechaCreacion: '2023-02-20T11:30:00Z',
      pagos: [],
    },
    {
      identifier: '3',
      codigo: 'BBVA',
      descripcion: 'BBVA Continental',
      habilitado: true,
      fechaCreacion: '2023-03-10T14:00:00Z',
      pagos: [],
    },
    {
      identifier: '4',
      codigo: 'SCO',
      descripcion: 'Scotiabank Perú',
      habilitado: false,
      fechaCreacion: '2023-04-05T16:45:00Z',
      pagos: [],
    },
    {
      identifier: '5',
      codigo: 'BN',
      descripcion: 'Banco de la Nación',
      habilitado: true,
      fechaCreacion: '2023-05-01T08:20:00Z',
      pagos: [],
    },
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleHabilitado(banco: BancoDto) {
    banco.habilitado = !banco.habilitado;
    console.log(`Cambiando estado de ${banco.descripcion}. Nuevo estado: ${banco.habilitado}`);
    // Aquí irá la llamada al servicio para persistir el cambio
  }
}