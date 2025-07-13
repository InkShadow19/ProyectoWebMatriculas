import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { MatriculaDto } from 'src/app/models/matricula.model';
import { CronogramaPagoDto } from 'src/app/models/cronograma-pago.model';
import { SituacionReference } from 'src/app/models/enums/situacion-reference.enum';
import { EstadoDeudaReference } from 'src/app/models/enums/estado-deuda-reference.enum';

// Interfaz extendida para manejar todos los datos necesarios
interface MatriculaCompleta extends MatriculaDto {
  estudiante: string;
  dniEstudiante: string;
  apoderado: string;
  telefonoApoderado: string;
  nivel: string;
  grado: string;
  anioAcademico: string;
  avatarUrl?: string; // NUEVO: Para el avatar dinámico
}

// Interfaz para el formulario de nueva matricula
interface NuevaMatriculaForm {
  estudianteBusqueda?: string;
  estudiante?: string;
  dniEstudiante?: string;
  apoderado?: string;
  nivel?: string;
  grado?: string;
  situacion?: SituacionReference;
  procedenciaTipo?: string;
  procedenciaNombre?: string;
  descuentoMatricula?: number;
  descuentoPension?: number;
  avatarUrl?: string; // NUEVO: Para el avatar dinámico
}


@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule],
  templateUrl: './matriculas.component.html',
  styleUrl: './matriculas.component.scss'
})
export class MatriculasComponent implements OnInit {
  // --- Propiedades para el Modal de Detalle ---
  showModal: boolean = false;
  selectedMatricula: MatriculaCompleta | null = null;

  // --- Propiedades para el Modal de Nueva Matrícula ---
  showNuevaMatriculaModal: boolean = false;
  nuevaMatricula: Partial<NuevaMatriculaForm> = {};
  busquedaEstudianteRealizada: boolean = false;
  mostrarCamposProcedencia: boolean = false;

  // Hacemos los enums accesibles desde la plantilla
  SituacionReference = SituacionReference;
  EstadoDeudaReference = EstadoDeudaReference;

  // --- Listas de Datos ---
  allMatriculas: MatriculaCompleta[] = [];
  filteredMatriculas: MatriculaCompleta[] = [];

  // --- Filtros ---
  filtroAnio: string = '2025';
  filtroNivel: string = '';
  filtroGrado: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  // --- Datos para los Selectores ---
  anios: number[] = [2025, 2024, 2023];
  niveles: string[] = ['Inicial', 'Primaria', 'Secundaria'];
  grados: string[] = [];
  situaciones: string[] = Object.values(SituacionReference);
  tiposProcedencia: string[] = ['Otra Institución', 'Nido/Cuna', 'Del Extranjero'];

  // --- Paginación ---
  currentPage: number = 1;
  itemsPerPage: number = 5;
  pagedMatriculas: MatriculaCompleta[] = [];
  pagesArray: number[] = [];

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.allMatriculas = [
      {
        identifier: 'mat-1', codigo: 2025001, estudiante: 'Carlos Vargas Llosa', dniEstudiante: '78945612', apoderado: 'Maria Vargas Llosa', telefonoApoderado: '987654321', grado: '5 Años', nivel: 'Inicial', situacion: SituacionReference.PROMOVIDO, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-10', fechaCreacion: '2025-01-15T09:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c1-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
          { identifier: 'c1-2', descripcionPersonalizada: 'Pensión Abril', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-04-30', estadoDeuda: EstadoDeudaReference.PENDIENTE, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-2', codigo: 2025002, estudiante: 'Ana Ruiz Torres', dniEstudiante: '71234567', apoderado: 'Juan Ruiz Torres', telefonoApoderado: '912345678', grado: '1er Grado', nivel: 'Primaria', situacion: SituacionReference.INGRESANTE, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-11', fechaCreacion: '2025-01-16T11:20:00Z', institucion_procendencia: 'Colegio San Agustín', cronogramas: [
          { identifier: 'c2-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 800.00, descuento: 50, mora: 0, montoAPagar: 750.00, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-11', matricula: 'mat-2', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-3', codigo: 2024001, estudiante: 'Lucia Mendoza', dniEstudiante: '76543210', apoderado: 'Elena Mendoza Rojas', telefonoApoderado: '955443322', grado: '2do Grado', nivel: 'Primaria', situacion: SituacionReference.REPITENTE, habilitado: false, anioAcademico: '2024', fechaMatricula: '2024-02-15', fechaCreacion: '2024-01-20T14:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c3-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 780.00, descuento: 0, mora: 25.50, montoAPagar: 805.50, fechaVencimiento: '2024-03-31', estadoDeuda: EstadoDeudaReference.VENCIDO, habilitado: true, fechaCreacion: '2024-02-15', matricula: 'mat-3', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-1', codigo: 2025001, estudiante: 'Carlos Vargas Llosa', dniEstudiante: '78945612', apoderado: 'Maria Vargas Llosa', telefonoApoderado: '987654321', grado: '5 Años', nivel: 'Inicial', situacion: SituacionReference.PROMOVIDO, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-10', fechaCreacion: '2025-01-15T09:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c1-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
          { identifier: 'c1-2', descripcionPersonalizada: 'Pensión Abril', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-04-30', estadoDeuda: EstadoDeudaReference.PENDIENTE, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-2', codigo: 2025002, estudiante: 'Ana Ruiz Torres', dniEstudiante: '71234567', apoderado: 'Juan Ruiz Torres', telefonoApoderado: '912345678', grado: '1er Grado', nivel: 'Primaria', situacion: SituacionReference.INGRESANTE, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-11', fechaCreacion: '2025-01-16T11:20:00Z', institucion_procendencia: 'Colegio San Agustín', cronogramas: [
          { identifier: 'c2-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 800.00, descuento: 50, mora: 0, montoAPagar: 750.00, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-11', matricula: 'mat-2', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-3', codigo: 2024001, estudiante: 'Lucia Mendoza', dniEstudiante: '76543210', apoderado: 'Elena Mendoza Rojas', telefonoApoderado: '955443322', grado: '2do Grado', nivel: 'Primaria', situacion: SituacionReference.REPITENTE, habilitado: false, anioAcademico: '2024', fechaMatricula: '2024-02-15', fechaCreacion: '2024-01-20T14:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c3-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 780.00, descuento: 0, mora: 25.50, montoAPagar: 805.50, fechaVencimiento: '2024-03-31', estadoDeuda: EstadoDeudaReference.VENCIDO, habilitado: true, fechaCreacion: '2024-02-15', matricula: 'mat-3', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-1', codigo: 2025001, estudiante: 'Carlos Vargas Llosa', dniEstudiante: '78945612', apoderado: 'Maria Vargas Llosa', telefonoApoderado: '987654321', grado: '5 Años', nivel: 'Inicial', situacion: SituacionReference.PROMOVIDO, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-10', fechaCreacion: '2025-01-15T09:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c1-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
          { identifier: 'c1-2', descripcionPersonalizada: 'Pensión Abril', montoOriginal: 750.50, descuento: 0, mora: 0, montoAPagar: 750.50, fechaVencimiento: '2025-04-30', estadoDeuda: EstadoDeudaReference.PENDIENTE, habilitado: true, fechaCreacion: '2025-02-10', matricula: 'mat-1', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-2', codigo: 2025002, estudiante: 'Ana Ruiz Torres', dniEstudiante: '71234567', apoderado: 'Juan Ruiz Torres', telefonoApoderado: '912345678', grado: '1er Grado', nivel: 'Primaria', situacion: SituacionReference.INGRESANTE, habilitado: true, anioAcademico: '2025', fechaMatricula: '2025-02-11', fechaCreacion: '2025-01-16T11:20:00Z', institucion_procendencia: 'Colegio San Agustín', cronogramas: [
          { identifier: 'c2-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 800.00, descuento: 50, mora: 0, montoAPagar: 750.00, fechaVencimiento: '2025-03-31', estadoDeuda: EstadoDeudaReference.PAGADO, habilitado: true, fechaCreacion: '2025-02-11', matricula: 'mat-2', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      },
      {
        identifier: 'mat-3', codigo: 2024001, estudiante: 'Lucia Mendoza', dniEstudiante: '76543210', apoderado: 'Elena Mendoza Rojas', telefonoApoderado: '955443322', grado: '2do Grado', nivel: 'Primaria', situacion: SituacionReference.REPITENTE, habilitado: false, anioAcademico: '2024', fechaMatricula: '2024-02-15', fechaCreacion: '2024-01-20T14:00:00Z', institucion_procendencia: '', cronogramas: [
          { identifier: 'c3-1', descripcionPersonalizada: 'Pensión Marzo', montoOriginal: 780.00, descuento: 0, mora: 25.50, montoAPagar: 805.50, fechaVencimiento: '2024-03-31', estadoDeuda: EstadoDeudaReference.VENCIDO, habilitado: true, fechaCreacion: '2024-02-15', matricula: 'mat-3', conceptoPago: 'PENS-REG', detalles: [] },
        ]
      }
    ];
    this.buscar();
  }

  // --- NUEVO: Método para generar la URL del avatar ---
  generarAvatarUrl(nombre: string): string {
    if (!nombre) {
      return 'https://placehold.co/64x64/E2E8F0/4A5568?text=??';
    }
    const partes = nombre.split(' ');
    let iniciales = partes[0].charAt(0);
    if (partes.length > 1) {
      iniciales += partes[1].charAt(0);
    }
    const size = '64x64';
    const bgColor = 'E2E8F0'; // Un gris claro
    const textColor = '4A5568'; // Un gris oscuro
    return `https://placehold.co/${size}/${bgColor}/${textColor}?text=${iniciales.toUpperCase()}`;
  }


  // --- Métodos para Modal de Detalle ---
  verDetalle(matricula: MatriculaCompleta): void {
    // Generamos la URL del avatar al abrir el detalle
    matricula.avatarUrl = this.generarAvatarUrl(matricula.estudiante);
    this.selectedMatricula = matricula;
    this.showModal = true;
  }

  cerrarModal(): void {
    this.showModal = false;
    this.selectedMatricula = null;
  }

  // --- Métodos para Modal de Nueva Matrícula ---
  abrirNuevaMatriculaModal(): void {
    this.showNuevaMatriculaModal = true;
  }

  cerrarNuevaMatriculaModal(): void {
    this.showNuevaMatriculaModal = false;
    this.nuevaMatricula = {};
    this.busquedaEstudianteRealizada = false;
    this.mostrarCamposProcedencia = false;
  }

  buscarEstudiante(): void {
    if (this.nuevaMatricula.estudianteBusqueda) {
      this.nuevaMatricula.estudiante = 'Sofía Torres Rojas';
      this.nuevaMatricula.dniEstudiante = '78995544';
      // Generamos la URL del avatar después de la búsqueda
      this.nuevaMatricula.avatarUrl = this.generarAvatarUrl(this.nuevaMatricula.estudiante);
      this.busquedaEstudianteRealizada = true;
    }
  }

  onSituacionChange(event: Event): void {
    const situacion = (event.target as HTMLSelectElement).value;
    this.mostrarCamposProcedencia = situacion === SituacionReference.INGRESANTE;
  }

  registrarMatricula(): void {
    console.log('Datos de la nueva matrícula:', this.nuevaMatricula);
    this.cerrarNuevaMatriculaModal();
  }

  // --- Métodos de Filtro y Paginación (sin cambios) ---
  actualizarGrados() {
    if (this.filtroNivel === 'Inicial')
      this.grados = ['3 Años', '4 Años', '5 Años'];
    else if (this.filtroNivel === 'Primaria')
      this.grados = ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'];
    else if (this.filtroNivel === 'Secundaria')
      this.grados = ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'];
    else this.grados = [];
    this.filtroGrado = '';
  }

  buscar() {
    let data = [...this.allMatriculas];
    const searchTerm = this.filtroBusqueda.toLowerCase().trim();
    data = data.filter(m => {
      const anioMatch = !this.filtroAnio || m.anioAcademico === this.filtroAnio;
      const estadoMatch = this.filtroEstado === '' || String(m.habilitado) === this.filtroEstado;
      const nivelMatch = this.filtroNivel === '' || m.nivel === this.filtroNivel;
      const gradoMatch = this.filtroGrado === '' || m.grado === this.filtroGrado;
      const searchMatch = !searchTerm || m.estudiante.toLowerCase().includes(searchTerm) || m.dniEstudiante.includes(searchTerm) || String(m.codigo).includes(searchTerm);
      return anioMatch && estadoMatch && nivelMatch && gradoMatch && searchMatch;
    });
    this.filteredMatriculas = data; this.setPage(1);
  }

  limpiarFiltros() {
    this.filtroAnio = '2025';
    this.filtroNivel = '';
    this.filtroGrado = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
    this.actualizarGrados();
    this.buscar();
  }

  setPage(page: number) {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) {
      if (this.pagedMatriculas.length === 0 && totalPages > 0) { page = totalPages; }
      else {
        return;
      }
    } this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    this.pagedMatriculas = this.filteredMatriculas.slice(startIndex, startIndex + this.itemsPerPage);
    this.pagesArray = Array(totalPages).fill(0).map((x, i) => i + 1);
    this.cdr.detectChanges();
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredMatriculas.length / this.itemsPerPage);
  }
}