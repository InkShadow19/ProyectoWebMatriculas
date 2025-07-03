import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';

@Component({
  selector: 'app-apoderados',
  standalone: true,
  imports: [CommonModule, SharedModule],
  templateUrl: './apoderados.component.html',
  styleUrl: './apoderados.component.scss'
})
export class ApoderadosComponent implements OnInit {
  
  apoderados: ApoderadoDto[] = [
    // --- 20 Registros de Apoderados ---
    { identifier: '1', dni: '45678912', nombre: 'Maria', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', parentesco: 'Madre', fechaNacimiento: '1985-02-20', genero: GeneroReference.FEMENINO, telefono: '987654321', email: 'maria.vargas@email.com', direccion: 'Av. Los Proceres 123, Surco', habilitado: true, fechaCreacion: '2024-01-20T09:00:00Z', matriculas: [] },
    { identifier: '2', dni: '41234567', nombre: 'Juan', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', parentesco: 'Padre', fechaNacimiento: '1982-11-30', genero: GeneroReference.MASCULINO, telefono: '912345678', email: 'juan.ruiz@email.com', direccion: 'Jr. de la Union 456, Lima', habilitado: true, fechaCreacion: '2024-01-22T11:00:00Z', matriculas: [] },
    { identifier: '3', dni: '44556677', nombre: 'Elena', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Rojas', parentesco: 'Madre', fechaNacimiento: '1990-07-12', genero: GeneroReference.FEMENINO, telefono: '955443322', email: 'elena.mendoza@email.com', direccion: 'Av. Arequipa 2450, Lince', habilitado: true, fechaCreacion: '2024-02-01T08:10:00Z', matriculas: [] },
    { identifier: '4', dni: '47896541', nombre: 'Ricardo', apellidoPaterno: 'Soto', apellidoMaterno: 'Diaz', parentesco: 'Tío', fechaNacimiento: '1988-01-05', genero: GeneroReference.MASCULINO, telefono: '963258741', email: 'ricardo.soto@email.com', direccion: 'Av. Javier Prado 550, San Borja', habilitado: true, fechaCreacion: '2024-02-03T16:30:00Z', matriculas: [] },
    { identifier: '5', dni: '40123456', nombre: 'Carmen', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', parentesco: 'Abuela', fechaNacimiento: '1965-12-25', genero: GeneroReference.FEMENINO, telefono: '987123456', email: 'carmen.quispe@email.com', direccion: 'Urb. Santa Patricia, La Molina', habilitado: false, fechaCreacion: '2024-02-05T12:05:00Z', matriculas: [] },
    { identifier: '6', dni: '42345678', nombre: 'Luis', apellidoPaterno: 'Flores', apellidoMaterno: 'Castillo', parentesco: 'Padre', fechaNacimiento: '1980-09-15', genero: GeneroReference.MASCULINO, telefono: '940123789', email: 'luis.flores@email.com', direccion: 'Av. Angamos 987, Miraflores', habilitado: true, fechaCreacion: '2024-02-10T09:50:00Z', matriculas: [] },
    { identifier: '7', dni: '48765432', nombre: 'Patricia', apellidoPaterno: 'Chavez', apellidoMaterno: 'Gutierrez', parentesco: 'Madre', fechaNacimiento: '1989-03-28', genero: GeneroReference.FEMENINO, telefono: '932165498', email: 'patricia.chavez@email.com', direccion: 'Calle Schell 345, Miraflores', habilitado: true, fechaCreacion: '2024-02-11T15:05:00Z', matriculas: [] },
    { identifier: '8', dni: '41122334', nombre: 'Jorge', apellidoPaterno: 'Ramos', apellidoMaterno: 'Morales', parentesco: 'Padre', fechaNacimiento: '1978-05-21', genero: GeneroReference.MASCULINO, telefono: '921345678', email: 'jorge.ramos@email.com', direccion: 'Av. Benavides 1540, Miraflores', habilitado: true, fechaCreacion: '2024-02-12T18:15:00Z', matriculas: [] },
    { identifier: '9', dni: '43344556', nombre: 'Laura', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva', parentesco: 'Madre', fechaNacimiento: '1992-02-11', genero: GeneroReference.FEMENINO, telefono: '911223344', email: 'laura.castro@email.com', direccion: 'Jr. Huiracocha 2050, Jesus Maria', habilitado: true, fechaCreacion: '2024-02-15T10:05:00Z', matriculas: [] },
    { identifier: '10', dni: '45566778', nombre: 'Miguel', apellidoPaterno: 'Ortega', apellidoMaterno: 'Paredes', parentesco: 'Padre', fechaNacimiento: '1983-04-18', genero: GeneroReference.MASCULINO, telefono: '933445566', email: 'miguel.ortega@email.com', direccion: 'Av. La Marina 2233, San Miguel', habilitado: false, fechaCreacion: '2024-02-18T11:05:00Z', matriculas: [] },
    { identifier: '11', dni: '47788990', nombre: 'Beatriz', apellidoPaterno: 'Salazar', apellidoMaterno: 'Cardenas', parentesco: 'Tía', fechaNacimiento: '1986-08-01', genero: GeneroReference.FEMENINO, telefono: '955667788', email: 'beatriz.salazar@email.com', direccion: 'Calle Los Ficus 101, Santa Anita', habilitado: true, fechaCreacion: '2024-02-20T13:50:00Z', matriculas: [] },
    { identifier: '12', dni: '49900112', nombre: 'Roberto', apellidoPaterno: 'Guerrero', apellidoMaterno: 'Delgado', parentesco: 'Padre', fechaNacimiento: '1981-10-25', genero: GeneroReference.MASCULINO, telefono: '977889900', email: 'roberto.guerrero@email.com', direccion: 'Av. Elmer Faucett 300, Callao', habilitado: true, fechaCreacion: '2024-02-22T14:35:00Z', matriculas: [] },
    { identifier: '13', dni: '42468135', nombre: 'Monica', apellidoPaterno: 'Luna', apellidoMaterno: 'Campos', parentesco: 'Madre', fechaNacimiento: '1987-06-14', genero: GeneroReference.FEMENINO, telefono: '999001122', email: 'monica.luna@email.com', direccion: 'Av. Grau 850, Barranco', habilitado: true, fechaCreacion: '2024-02-25T09:05:00Z', matriculas: [] },
    { identifier: '14', dni: '41357924', nombre: 'David', apellidoPaterno: 'Vega', apellidoMaterno: 'Rios', parentesco: 'Padre', fechaNacimiento: '1979-03-03', genero: GeneroReference.MASCULINO, telefono: '924681357', email: 'david.vega@email.com', direccion: 'Calle Misti 321, Yanahuara, Arequipa', habilitado: true, fechaCreacion: '2024-03-01T10:20:00Z', matriculas: [] },
    { identifier: '15', dni: '43579246', nombre: 'Silvia', apellidoPaterno: 'Navarro', apellidoMaterno: 'Solis', parentesco: 'Madre', fechaNacimiento: '1991-09-09', genero: GeneroReference.FEMENINO, telefono: '913579246', email: 'silvia.navarro@email.com', direccion: 'Av. El Sol 456, Cusco', habilitado: true, fechaCreacion: '2024-03-02T11:05:00Z', matriculas: [] },
    { identifier: '16', dni: '45792468', nombre: 'Oscar', apellidoPaterno: 'Ponce', apellidoMaterno: 'Leon', parentesco: 'Abuelo', fechaNacimiento: '1960-01-01', genero: GeneroReference.MASCULINO, telefono: '935792468', email: 'oscar.ponce@email.com', direccion: 'Jr. Puno 789, Trujillo', habilitado: true, fechaCreacion: '2024-03-03T12:25:00Z', matriculas: [] },
    { identifier: '17', dni: '47924681', nombre: 'Raquel', apellidoPaterno: 'Miranda', apellidoMaterno: 'Acosta', parentesco: 'Madre', fechaNacimiento: '1984-04-04', genero: GeneroReference.FEMENINO, telefono: '957924680', email: 'raquel.miranda@email.com', direccion: 'Calle Real 123, Huancayo', habilitado: true, fechaCreacion: '2024-03-04T16:05:00Z', matriculas: [] },
    { identifier: '18', dni: '49246813', nombre: 'Fernando', apellidoPaterno: 'Benites', apellidoMaterno: 'Fuentes', parentesco: 'Padre', fechaNacimiento: '1980-08-18', genero: GeneroReference.MASCULINO, telefono: '992468135', email: 'fernando.benites@email.com', direccion: 'Av. Pardo 567, Iquitos', habilitado: false, fechaCreacion: '2024-03-05T17:05:00Z', matriculas: [] },
    { identifier: '19', dni: '44681357', nombre: 'Gloria', apellidoPaterno: 'Herrera', apellidoMaterno: 'Aguilar', parentesco: 'Madre', fechaNacimiento: '1988-10-10', genero: GeneroReference.FEMENINO, telefono: '946813579', email: 'gloria.herrera@email.com', direccion: 'Calle San Martin 852, Piura', habilitado: true, fechaCreacion: '2024-03-06T18:05:00Z', matriculas: [] },
    { identifier: '20', dni: '46813579', nombre: 'Hugo', apellidoPaterno: 'Paz', apellidoMaterno: 'Mendoza', parentesco: 'Padre', fechaNacimiento: '1975-05-05', genero: GeneroReference.MASCULINO, telefono: '968135791', email: 'hugo.paz@email.com', direccion: 'Av. Bolognesi 111, Tacna', habilitado: true, fechaCreacion: '2024-03-07T19:00:00Z', matriculas: [] }
  ];

  constructor() { }

  ngOnInit(): void { }

  toggleHabilitado(apoderado: ApoderadoDto) {
    apoderado.habilitado = !apoderado.habilitado;
    console.log(
      `Cambiando estado de ${apoderado.nombre}. Nuevo estado: ${apoderado.habilitado}`
    );
    // Aquí iría tu llamada al servicio para actualizar en el backend
  }
}