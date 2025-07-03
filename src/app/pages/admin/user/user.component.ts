import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { UsuarioDto } from 'src/app/models/usuario.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {

  usuarios: UsuarioDto[] = [
    {
      identifier: '1',
      usuario: 'pfuertes',
      nombres: 'Percy',
      apellidos: 'Fuertes Anaya',
      dni: '45871236',
      fechaNacimiento: '1976-01-15T10:00:00Z',
      genero: GeneroReference.MASCULINO,
      rol: 'Administrador',
      habilitado: true,
      fechaCreacion: '2024-01-15T10:00:00Z',
      pagos: [],
    },
    {
      identifier: '2',
      usuario: 'emartinez',
      nombres: 'Emily',
      apellidos: 'Martinez Diaz',
      dni: '41257896',
      fechaNacimiento: '1997-12-02T10:00:00Z',
      genero: GeneroReference.FEMENINO,
      rol: 'Secretaria',
      habilitado: true,
      fechaCreacion: '2024-02-01T11:30:00Z',
      pagos: [],
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleHabilitado(usuario: UsuarioDto) {
    usuario.habilitado = !usuario.habilitado;
    console.log(`Cambiando estado de ${usuario.usuario}. Nuevo estado: ${usuario.habilitado}`);
    // Aquí irá la llamada al servicio para guardar el cambio
  }
}
