import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { ReporteService } from 'src/app/services/reporte.service';
import { NivelService } from 'src/app/services/nivel.service';
import { GradoService } from 'src/app/services/grado.service';
import { AnioAcademicoService } from 'src/app/services/anio-academico.service';
import { NivelDto } from 'src/app/models/nivel.model';
import { GradoDto } from 'src/app/models/grado.model';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { AlumnoPorGradoDto } from 'src/app/models/alumno-por-grado.model';
import { MorosidadAgrupadaDto } from 'src/app/models/morosidad-agrupada.model';
import { PagosPorPeriodoDto } from 'src/app/models/pagos-por-periodo.model';
import Swal from 'sweetalert2';
import { EstadoCuentaDto } from 'src/app/models/estado-cuenta.model';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { EstudianteService } from 'src/app/services/estudiante.service';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  reporteSeleccionado: string | null = null;
  mostrarResultados: boolean = false;
  tituloReporteGenerado: string = '';

  // --- PROPIEDADES PARA LA BÚSQUEDA INTERACTIVA ---
  estudiantesEncontrados: EstudianteDto[] = [];
  estudianteSeleccionadoParaReporte: EstudianteDto | null = null;

  // --- NUEVA PROPIEDAD PARA EL TOTAL ---
  totalIngresosReporte: number = 0;

  // --- Datos para los Filtros ---
  anios: AnioAcademicoDto[] = [];
  niveles: NivelDto[] = [];
  grados: GradoDto[] = [];
  gradosFiltrados: GradoDto[] = [];

  // --- Modelo para los Filtros ---
  filtros: any = {
    anioId: '',
    busquedaEstudiante: '',
    nivelId: '',
    gradoId: '',
    fechaInicio: '',
    fechaFin: ''
  };

  // --- RESULTADOS SEPARADOS POR TIPO DE REPORTE ---
  columnas: string[] = [];
  resultadosAlumnosPorGrado: AlumnoPorGradoDto[] = [];
  resultadosMorosidad: MorosidadAgrupadaDto[] = [];
  resultadosPagosPorPeriodo: PagosPorPeriodoDto[] = [];
  resultadosEstadoCuenta: EstadoCuentaDto[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private reporteService: ReporteService,
    private anioAcademicoService: AnioAcademicoService,
    private estudianteService: EstudianteService,
    private nivelService: NivelService,
    private gradoService: GradoService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    // Cargamos todos los datos necesarios para los filtros
    this.anioAcademicoService.getList(0, 100).subscribe(res => {
      this.anios = res?.content || [];
      const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
      if (anioActivo) {
        this.filtros.anioId = anioActivo.identifier;
      }
    });
    this.nivelService.getList(0, 100).subscribe(res => this.niveles = res?.content || []);
    this.gradoService.getList(0, 1000).subscribe(res => this.grados = res?.content || []);
  }

  seleccionarReporte(tipo: string): void {
    if (this.reporteSeleccionado === tipo) {
      this.reporteSeleccionado = null;
      this.mostrarResultados = false;
    } else {
      this.reporteSeleccionado = tipo;
      this.limpiarFiltrosYResultados();
    }
  }

  onNivelChange(): void {
    this.filtros.gradoId = ''; // Resetea el grado
    if (this.filtros.nivelId) {
      this.gradosFiltrados = this.grados.filter(g => g.nivel === this.filtros.nivelId);
    } else {
      this.gradosFiltrados = [];
    }
  }

  // --- NUEVOS MÉTODOS PARA BÚSQUEDA INTERACTIVA ---
  buscarEstudianteParaReporte(): void {
    const busqueda = this.filtros.busquedaEstudiante?.trim();
    if (busqueda && busqueda.length >= 2) {
      this.estudianteService.getSearchActivos(0, 5, busqueda).subscribe(res => {
        this.estudiantesEncontrados = res?.content || [];
      });
    } else {
      this.estudiantesEncontrados = [];
    }
  }

  seleccionarEstudianteParaReporte(estudiante: EstudianteDto): void {
    this.estudianteSeleccionadoParaReporte = estudiante;
    this.filtros.busquedaEstudiante = `${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`;
    this.estudiantesEncontrados = []; // Oculta la lista
  }

  generarReporte(): void {
    if (!this.reporteSeleccionado) {
      Swal.fire('Selección Requerida', 'Por favor, seleccione un tipo de reporte.', 'info');
      return;
    }

    switch (this.reporteSeleccionado) {
      case 'alumnos-grado':
        this.generarReporteAlumnosPorGrado();
        break;
      case 'morosidad':
        this.generarReporteMorosidad();
        break;
      case 'pagos-periodo':
        this.generarReportePagosPorPeriodo();
        break;
      case 'estado-cuenta':
        this.generarReporteEstadoCuenta();
        break;
      default:
        Swal.fire('En Desarrollo', 'Este tipo de reporte aún no ha sido implementado.', 'warning');
    }
  }

  private generarReporteAlumnosPorGrado(): void {
    // 1. Verificamos que se haya seleccionado un año en el filtro.
    if (!this.filtros.anioId) {
      Swal.fire('Filtro Requerido', 'Por favor, seleccione un Año Académico para generar el reporte.', 'warning');
      return;
    }

    // 2. Buscamos el objeto completo del año académico en nuestra lista de años.
    const anioSeleccionado = this.anios.find(a => a.identifier === this.filtros.anioId);

    // 3. Verificamos si realmente lo encontramos (esto previene el error 'undefined').
    if (!anioSeleccionado) return;

    // 4. Si todo está bien, llamamos al servicio con el valor numérico del año (ej. 2025).
    this.reporteService.getAlumnosPorGrado(anioSeleccionado.anio, this.filtros.nivelId, this.filtros.gradoId)
      .subscribe(data => {
        this.resultadosAlumnosPorGrado = data || []; // Asigna al array correcto
        this.columnas = ['DNI', 'Nombre Completo', 'Apoderado', 'Teléfono', 'Fecha Matrícula', 'Situación'];
        this.tituloReporteGenerado = `Resultados: Alumnos por Grado del ${anioSeleccionado.anio}`;
        this.mostrarResultados = true;
        this.cdr.detectChanges();
      });
  }

  private generarReporteMorosidad(): void {
    // 1. Validamos que se haya seleccionado un año.
    if (!this.filtros.anioId) {
      Swal.fire('Filtro Requerido', 'Por favor, seleccione un Año Académico para generar el reporte.', 'warning');
      return;
    }

    // 2. Buscamos el objeto completo del año académico en nuestra lista de años.
    const anioSeleccionado = this.anios.find(a => a.identifier === this.filtros.anioId);

    // 3. Verificamos si realmente lo encontramos (esto previene el error 'undefined').
    if (!anioSeleccionado) return;

    // 4. Llamamos al servicio con el año.
    this.reporteService.getReporteMorosidad(anioSeleccionado.anio, this.filtros.nivelId, this.filtros.gradoId)
      .subscribe(data => {
        this.resultadosMorosidad = data || []; // Asigna al array correcto
        this.columnas = ['Estudiante', 'Apoderado', 'Teléfono', 'Cuotas Vencidas', 'Monto Total Adeudado'];
        this.tituloReporteGenerado = `Resultados: Reporte de Morosidad del ${anioSeleccionado.anio}`;
        this.mostrarResultados = true;
        this.cdr.detectChanges();
      });
  }

  private generarReportePagosPorPeriodo(): void {
    if (!this.filtros.fechaInicio || !this.filtros.fechaFin) {
      Swal.fire('Filtros Requeridos', 'Por favor, seleccione una fecha de inicio y una fecha de fin.', 'warning');
      return;
    }

    this.reporteService.getPagosPorPeriodo(this.filtros.fechaInicio, this.filtros.fechaFin)
      .subscribe(data => {
        if (data) {
          this.resultadosPagosPorPeriodo = data;
          this.columnas = ['Nº Ticket', 'Fecha de Pago', 'Estudiante', 'Registrado Por', 'Canal / Banco', 'Monto Pagado'];
          const fechaInicioF = new Date(this.filtros.fechaInicio + 'T00:00:00').toLocaleDateString('es-PE');
          const fechaFinF = new Date(this.filtros.fechaFin + 'T00:00:00').toLocaleDateString('es-PE');
          this.tituloReporteGenerado = `Resultados: Pagos Realizados (del ${fechaInicioF} al ${fechaFinF})`;
          this.totalIngresosReporte = data.reduce((sum, item) => sum + item.montoPagado, 0);
          this.mostrarResultados = true;
        } else {
          this.resultadosPagosPorPeriodo = [];
          Swal.fire('Error', 'No se pudo generar el reporte de pagos.', 'error');
        }
        this.cdr.detectChanges();
      });
  }

  private generarReporteEstadoCuenta(): void {
    // 1. La validación ahora comprueba si se ha seleccionado un estudiante Y un año.
    if (!this.estudianteSeleccionadoParaReporte) {
      Swal.fire('Filtro Requerido', 'Por favor, busque y seleccione un estudiante de la lista.', 'warning');
      return;
    }
    if (!this.filtros.anioId) {
        Swal.fire('Filtro Requerido', 'Por favor, seleccione un Año Académico.', 'warning');
        return;
    }

    const estudiante = this.estudianteSeleccionadoParaReporte;
    const anioSeleccionado = this.anios.find(a => a.identifier === this.filtros.anioId);

    // Verificación de seguridad por si el año no se encuentra
    if (!anioSeleccionado) {
        Swal.fire('Error Interno', 'No se pudo procesar el año académico seleccionado.', 'error');
        return;
    }

    // 2. Si se encuentra, pedimos su estado de cuenta pasando el ID del estudiante y el AÑO.
    this.reporteService.getEstadoCuenta(estudiante.identifier, anioSeleccionado.anio).subscribe(data => {
      if (data) {
        this.resultadosEstadoCuenta = data;
        // --- CABECERAS CORREGIDAS Y ORDENADAS ---
        this.columnas = ['Descripción', 'Fecha Vencimiento', 'Monto Original', 'Descuento', 'Mora', 'Monto a Pagar', 'Estado'];
        // --- TÍTULO CON NOMBRE COMPLETO ---
        this.tituloReporteGenerado = `Resultados: Estado de Cuenta de ${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`;
        this.mostrarResultados = true;
      } else {
        this.resultadosEstadoCuenta = [];
        Swal.fire('Sin Cronograma', 'El estudiante no tiene un cronograma de pagos asociado para el año seleccionado.', 'info');
      }
      this.cdr.detectChanges();
    });
  }

  limpiarFiltrosYResultados(): void {
    this.filtros.busquedaEstudiante = '';
    this.filtros.nivelId = '';
    this.filtros.gradoId = '';
    this.filtros.fechaInicio = '';
    this.filtros.fechaFin = '';
    const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
    this.filtros.anioId = anioActivo ? anioActivo.identifier : '';
    this.gradosFiltrados = [];
    this.resultadosPagosPorPeriodo = [];
    this.totalIngresosReporte = 0;
    this.mostrarResultados = false;
    this.resultadosAlumnosPorGrado = [];
    this.resultadosMorosidad = [];
    this.resultadosEstadoCuenta = [];
    this.estudianteSeleccionadoParaReporte = null;
    this.estudiantesEncontrados = [];
    this.columnas = [];
  }

  // --- NUEVO MÉTODO AUXILIAR PARA EL HTML ---
  hayResultados(): boolean {
    return this.resultadosAlumnosPorGrado.length > 0 || this.resultadosMorosidad.length > 0 || this.resultadosPagosPorPeriodo.length > 0 || this.resultadosEstadoCuenta.length > 0;
  }
}