import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { RolDto } from 'src/app/models/rol.model';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './roles.component.html',
  styleUrl: './roles.component.scss'
})
export class RolesComponent implements OnInit {
  
  roles: RolDto[] = [
    {
      identifier: '1',
      descripcion: 'Administrador',
      habilitado: true,
      fechaCreacion: '2024-01-10T09:00:00Z',
      usuarios: [],
    },
    {
      identifier: '2',
      descripcion: 'Secretaria',
      habilitado: true,
      fechaCreacion: '2024-01-11T10:30:00Z',
      usuarios: [],
    }
  ];

  constructor() {}

  ngOnInit(): void {}

  toggleHabilitado(rol: RolDto) {
    rol.habilitado = !rol.habilitado;
    console.log(`Cambiando estado de ${rol.descripcion}. Nuevo estado: ${rol.habilitado}`);
    // Aquí irá la llamada al servicio para guardar el cambio
  }
}
