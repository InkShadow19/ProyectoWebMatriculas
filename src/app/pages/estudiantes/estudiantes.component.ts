import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { GeneroReference } from 'src/app/models/enums/genero-reference.enum';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule
  ],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss'
})
export class EstudiantesComponent implements OnInit {
 
  // --- PROPIEDADES PARA LA PAGINACIÓN ---
  currentPage: number = 1;
  itemsPerPage: number = 5; // Puedes cambiar este número para mostrar más o menos items por página
  pagedEstudiantes: EstudianteDto[] = []; // Array para los estudiantes de la página actual

  estudiantes: EstudianteDto[] = [
    // --- 20 Registros de Estudiantes ---
    { identifier: '1', dni: '78945612', nombre: 'Carlos', apellidoPaterno: 'Vargas', apellidoMaterno: 'Llosa', fechaNacimiento: '2010-05-15', genero: GeneroReference.MASCULINO, direccion: 'Av. Los Proceres 123, Surco', telefono: '987654321', email: 'carlos.vargas@email.com', habilitado: true, fechaCreacion: '2024-01-20T10:00:00Z', matriculas: [] },
    { identifier: '2', dni: '71234567', nombre: 'Ana', apellidoPaterno: 'Ruiz', apellidoMaterno: 'Torres', fechaNacimiento: '2011-08-22', genero: GeneroReference.FEMENINO, direccion: 'Jr. de la Union 456, Lima', telefono: '912345678', email: 'ana.ruiz@email.com', habilitado: true, fechaCreacion: '2024-01-22T11:30:00Z', matriculas: [] },
    { identifier: '3', dni: '75689123', nombre: 'Pedro', apellidoPaterno: 'Gomez', apellidoMaterno: 'Perez', fechaNacimiento: '2010-03-10', genero: GeneroReference.MASCULINO, direccion: 'Calle Las Begonias 789, San Isidro', telefono: '998877665', email: 'pedro.gomez@email.com', habilitado: false, fechaCreacion: '2023-11-05T14:00:00Z', matriculas: [] },
    { identifier: '4', dni: '76543210', nombre: 'Lucia', apellidoPaterno: 'Mendoza', apellidoMaterno: 'Rojas', fechaNacimiento: '2012-01-30', genero: GeneroReference.FEMENINO, direccion: 'Av. Arequipa 2450, Lince', telefono: '955443322', email: 'lucia.mendoza@email.com', habilitado: true, fechaCreacion: '2024-02-01T08:00:00Z', matriculas: [] },
    { identifier: '5', dni: '74125896', nombre: 'Javier', apellidoPaterno: 'Soto', apellidoMaterno: 'Diaz', fechaNacimiento: '2011-11-11', genero: GeneroReference.MASCULINO, direccion: 'Av. Javier Prado 550, San Borja', telefono: '963258741', email: 'javier.soto@email.com', habilitado: true, fechaCreacion: '2024-02-03T16:20:00Z', matriculas: [] },
    { identifier: '6', dni: '79876543', nombre: 'Sofia', apellidoPaterno: 'Quispe', apellidoMaterno: 'Mamani', fechaNacimiento: '2010-09-05', genero: GeneroReference.FEMENINO, direccion: 'Urb. Santa Patricia, La Molina', telefono: '987123456', email: 'sofia.quispe@email.com', habilitado: true, fechaCreacion: '2024-02-05T12:00:00Z', matriculas: [] },
    { identifier: '7', dni: '70102030', nombre: 'Mateo', apellidoPaterno: 'Flores', apellidoMaterno: 'Castillo', fechaNacimiento: '2012-07-18', genero: GeneroReference.MASCULINO, direccion: 'Av. Angamos 987, Miraflores', telefono: '940123789', email: 'mateo.flores@email.com', habilitado: true, fechaCreacion: '2024-02-10T09:45:00Z', matriculas: [] },
    { identifier: '8', dni: '72345678', nombre: 'Valentina', apellidoPaterno: 'Chavez', apellidoMaterno: 'Gutierrez', fechaNacimiento: '2011-04-25', genero: GeneroReference.FEMENINO, direccion: 'Calle Schell 345, Miraflores', telefono: '932165498', email: 'valentina.chavez@email.com', habilitado: true, fechaCreacion: '2024-02-11T15:00:00Z', matriculas: [] },
    { identifier: '9', dni: '78765432', nombre: 'Diego', apellidoPaterno: 'Ramos', apellidoMaterno: 'Morales', fechaNacimiento: '2010-02-14', genero: GeneroReference.MASCULINO, direccion: 'Av. Benavides 1540, Miraflores', telefono: '921345678', email: 'diego.ramos@email.com', habilitado: true, fechaCreacion: '2024-02-12T18:10:00Z', matriculas: [] },
    { identifier: '10', dni: '71122334', nombre: 'Camila', apellidoPaterno: 'Castro', apellidoMaterno: 'Silva', fechaNacimiento: '2012-12-01', genero: GeneroReference.FEMENINO, direccion: 'Jr. Huiracocha 2050, Jesus Maria', telefono: '911223344', email: 'camila.castro@email.com', habilitado: false, fechaCreacion: '2024-02-15T10:00:00Z', matriculas: [] },
    { identifier: '11', dni: '73344556', nombre: 'Sebastian', apellidoPaterno: 'Ortega', apellidoMaterno: 'Paredes', fechaNacimiento: '2010-06-30', genero: GeneroReference.MASCULINO, direccion: 'Av. La Marina 2233, San Miguel', telefono: '933445566', email: 'sebastian.ortega@email.com', habilitado: true, fechaCreacion: '2024-02-18T11:00:00Z', matriculas: [] },
    { identifier: '12', dni: '75566778', nombre: 'Isabella', apellidoPaterno: 'Salazar', apellidoMaterno: 'Cardenas', fechaNacimiento: '2011-10-10', genero: GeneroReference.FEMENINO, direccion: 'Calle Los Ficus 101, Santa Anita', telefono: '955667788', email: 'isabella.salazar@email.com', habilitado: true, fechaCreacion: '2024-02-20T13:45:00Z', matriculas: [] },
    { identifier: '13', dni: '77788990', nombre: 'Nicolas', apellidoPaterno: 'Guerrero', apellidoMaterno: 'Delgado', fechaNacimiento: '2012-03-20', genero: GeneroReference.MASCULINO, direccion: 'Av. Elmer Faucett 300, Callao', telefono: '977889900', email: 'nicolas.guerrero@email.com', habilitado: true, fechaCreacion: '2024-02-22T14:30:00Z', matriculas: [] },
    { identifier: '14', dni: '79900112', nombre: 'Mariana', apellidoPaterno: 'Luna', apellidoMaterno: 'Campos', fechaNacimiento: '2010-08-08', genero: GeneroReference.FEMENINO, direccion: 'Av. Grau 850, Barranco', telefono: '999001122', email: 'mariana.luna@email.com', habilitado: true, fechaCreacion: '2024-02-25T09:00:00Z', matriculas: [] },
    { identifier: '15', dni: '72468135', nombre: 'Daniel', apellidoPaterno: 'Vega', apellidoMaterno: 'Rios', fechaNacimiento: '2011-01-25', genero: GeneroReference.MASCULINO, direccion: 'Calle Misti 321, Yanahuara, Arequipa', telefono: '924681357', email: 'daniel.vega@email.com', habilitado: true, fechaCreacion: '2024-03-01T10:15:00Z', matriculas: [] },
    { identifier: '16', dni: '71357924', nombre: 'Valeria', apellidoPaterno: 'Navarro', apellidoMaterno: 'Solis', fechaNacimiento: '2012-05-02', genero: GeneroReference.FEMENINO, direccion: 'Av. El Sol 456, Cusco', telefono: '913579246', email: 'valeria.navarro@email.com', habilitado: true, fechaCreacion: '2024-03-02T11:00:00Z', matriculas: [] },
    { identifier: '17', dni: '73579246', nombre: 'Alejandro', apellidoPaterno: 'Ponce', apellidoMaterno: 'Leon', fechaNacimiento: '2010-12-12', genero: GeneroReference.MASCULINO, direccion: 'Jr. Puno 789, Trujillo', telefono: '935792468', email: 'alejandro.ponce@email.com', habilitado: false, fechaCreacion: '2024-03-03T12:20:00Z', matriculas: [] },
    { identifier: '18', dni: '75792468', nombre: 'Gabriela', apellidoPaterno: 'Miranda', apellidoMaterno: 'Acosta', fechaNacimiento: '2011-02-28', genero: GeneroReference.FEMENINO, direccion: 'Calle Real 123, Huancayo', telefono: '957924680', email: 'gabriela.miranda@email.com', habilitado: true, fechaCreacion: '2024-03-04T16:00:00Z', matriculas: [] },
    { identifier: '19', dni: '79246813', nombre: 'Matias', apellidoPaterno: 'Benites', apellidoMaterno: 'Fuentes', fechaNacimiento: '2012-09-19', genero: GeneroReference.MASCULINO, direccion: 'Av. Pardo 567, Iquitos', telefono: '992468135', email: 'matias.benites@email.com', habilitado: true, fechaCreacion: '2024-03-05T17:00:00Z', matriculas: [] },
    { identifier: '20', dni: '74681357', nombre: 'Jimena', apellidoPaterno: 'Herrera', apellidoMaterno: 'Aguilar', fechaNacimiento: '2010-07-07', genero: GeneroReference.FEMENINO, direccion: 'Calle San Martin 852, Piura', telefono: '946813579', email: 'jimena.herrera@email.com', habilitado: true, fechaCreacion: '2024-03-06T18:00:00Z', matriculas: [] }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.setPage(1); // Carga la primera página al iniciar
  }

    // --- MÉTODOS PARA LA PAGINACIÓN ---

  setPage(page: number) {
    if (page < 1 || page > this.getTotalPages()) {
      return;
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage - 1, this.estudiantes.length - 1);
    this.pagedEstudiantes = this.estudiantes.slice(startIndex, endIndex + 1);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.estudiantes.length / this.itemsPerPage);
  }

  getPagesArray(): number[] {
    const totalPages = this.getTotalPages();
    return Array(totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- FIN DE MÉTODOS PARA LA PAGINACIÓN ---

  toggleHabilitado(estudiante: EstudianteDto) {
    estudiante.habilitado = !estudiante.habilitado;
    console.log(
      `Cambiando estado de ${estudiante.nombre}. Nuevo estado: ${estudiante.habilitado}`
    );
    // Aquí posiblemente iría tu llamada al servicio para actualizar en el backend
  }
}