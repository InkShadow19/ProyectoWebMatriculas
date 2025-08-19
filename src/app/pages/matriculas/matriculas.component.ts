import { Component, OnInit, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { MatriculaDto } from 'src/app/models/matricula.model';
import { NivelDto } from 'src/app/models/nivel.model';
import { GradoDto } from 'src/app/models/grado.model';
import { AnioAcademicoDto } from 'src/app/models/anio-academico.model';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { ApoderadoDto } from 'src/app/models/apoderado.model';
import { MatriculaService } from 'src/app/services/matricula.service';
import { NivelService } from 'src/app/services/nivel.service';
import { GradoService } from 'src/app/services/grado.service';
import { AnioAcademicoService } from 'src/app/services/anio-academico.service';
import { EstudianteService } from 'src/app/services/estudiante.service';
import { ApoderadoService } from 'src/app/services/apoderado.service';
import { PageResponse } from 'src/app/models/page-response.model';
import { SituacionReference } from 'src/app/models/enums/situacion-reference.enum';
import { EstadoMatriculaReference } from 'src/app/models/enums/estado-matricula-reference.enum';
import { EstadoDeudaReference } from 'src/app/models/enums/estado-deuda-reference.enum';
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ConceptoPagoService } from 'src/app/services/concepto-pago.service';
import localeEs from '@angular/common/locales/es-PE';
import { EstadoAcademicoReference } from 'src/app/models/enums/estado-academico-reference.enum';

// Interfaz para el formulario de nueva matricula
interface NuevaMatriculaForm {
  estudianteBusqueda: string;
  estudianteSeleccionado: EstudianteDto | null;
  apoderadoBusqueda: string;
  apoderadoSeleccionado: ApoderadoDto | null;
  anioAcademico: string;
  nivel: string;
  grado: string;
  situacion: SituacionReference;
  procedencia: string;
  descuentoMatricula?: number;
  descuentoPension?: number;
}

// --- NUEVA INTERFAZ PARA EL MODAL DE EDICIÓN ---
interface EditarMatriculaForm extends Partial<MatriculaDto> {
  nombreEstudiante?: string;
  nombreApoderado?: string;
  avatarUrl?: string;
  editandoEstudiante?: boolean;
  estudianteBusqueda?: string;
  editandoApoderado?: boolean;
  apoderadoBusqueda?: string;
}

registerLocaleData(localeEs, 'es-PE');

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule, NgbDropdownModule],
  templateUrl: './matriculas.component.html',
  styleUrls: ['./matriculas.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }]
})
export class MatriculasComponent implements OnInit {
  pagedMatriculas: PageResponse<MatriculaDto> | undefined;

  // Listas de datos
  anios: AnioAcademicoDto[] = [];
  niveles: NivelDto[] = [];
  grados: GradoDto[] = [];
  estudiantes: EstudianteDto[] = [];
  apoderados: ApoderadoDto[] = [];
  // --- NUEVAS PROPIEDADES PARA MONTOS BASE ---
  montoBaseMatricula: number = 0;
  montoBasePension: number = 0;

  // --- PROPIEDAD PARA GUARDAR EL AÑO ACTIVO ---
  anioActivoId: string = '';

  // Modelos de los filtros
  filtroNivel: string = '';
  filtroGrado: string = '';
  filtroEstado: string = EstadoMatriculaReference.VIGENTE;
  filtroBusqueda: string = '';

  // --- NUEVAS PROPIEDADES ---
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  gradosParaFiltro: GradoDto[] = []; // Lista de grados para el dropdown del filtro

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 5;

  // Enums
  SituacionReference = SituacionReference;
  EstadoMatriculaReference = EstadoMatriculaReference;
  EstadoDeudaReference = EstadoDeudaReference; // Añadido para el modal de detalle
  situaciones: string[] = Object.values(SituacionReference);

  // --- LÓGICA PARA EL MODAL DE NUEVA Y EDICIÓN DE MATRÍCULA ---
  showNuevaMatriculaModal = false;
  nuevaMatricula: Partial<NuevaMatriculaForm> = {};
  estudiantesEncontrados: EstudianteDto[] = [];
  apoderadosEncontrados: ApoderadoDto[] = [];
  gradosDelNivelSeleccionado: GradoDto[] = [];
  gradosParaEditar: GradoDto[] = [];

  // --- PROPIEDADES PARA LOS NUEVOS MODALES ---
  showDetalleModal = false;
  showEditarModal = false;
  matriculaSeleccionada: (MatriculaDto & { avatarUrl?: string }) | null = null;
  matriculaParaEditar: EditarMatriculaForm = {};
  tienePagosRegistrados = false;

  // TODO: Propiedades para los modales de Detalle y Edición

  constructor(
    private cdr: ChangeDetectorRef,
    private matriculaService: MatriculaService,
    private anioAcademicoService: AnioAcademicoService,
    private nivelService: NivelService,
    private gradoService: GradoService,
    private estudianteService: EstudianteService,
    private apoderadoService: ApoderadoService,
    private conceptoPagoService: ConceptoPagoService
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    forkJoin({
      anios: this.anioAcademicoService.getList(0, 100),
      niveles: this.nivelService.getList(0, 100),
      grados: this.gradoService.getList(0, 1000), // Cargar todos los grados de una vez
      estudiantes: this.estudianteService.getList(0, 1000),
      apoderados: this.apoderadoService.getList(0, 1000),
      conceptos: this.conceptoPagoService.getList(0, 100) // Añadir esta llamada
    }).subscribe(({ anios, niveles, grados, estudiantes, apoderados, conceptos }) => {
      this.anios = anios?.content || [];
      this.niveles = niveles?.content || [];
      this.grados = grados?.content || []; // Guardar todos los grados
      this.estudiantes = estudiantes?.content || [];
      this.apoderados = apoderados?.content || [];

      // --- LÓGICA ACTUALIZADA PARA CARGA INICIAL ---
      const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
      if (anioActivo && anioActivo.identifier) {
        this.anioActivoId = anioActivo.identifier;
      }

      // --- LÓGICA PARA EXTRAER MONTOS BASE ---
      const conceptoMatricula = conceptos?.content.find(c => c.codigo === 'MATR');
      const conceptoPension = conceptos?.content.find(c => c.codigo === 'PENS');
      this.montoBaseMatricula = conceptoMatricula?.montoSugerido || 280; // Valor por defecto si no se encuentra
      this.montoBasePension = conceptoPension?.montoSugerido || 300; // Valor por defecto si no se encuentra

      this.loadMatriculas();
    });
  }

  // --- MÉTODO CORREGIDO ---
  loadMatriculas(): void {
    const page = this.currentPage - 1;

    // Si no hay fechas seleccionadas, usamos el año activo por defecto.
    const anioParaFiltrar = (this.filtroFechaDesde || this.filtroFechaHasta) ? '' : this.anioActivoId;

    this.matriculaService.getList(
      page,
      this.itemsPerPage,
      this.filtroBusqueda,
      this.filtroEstado,
      anioParaFiltrar,
      this.filtroNivel,
      this.filtroGrado,
      this.filtroFechaDesde,
      this.filtroFechaHasta
    ).subscribe(response => {
      this.pagedMatriculas = response;
      this.cdr.detectChanges();
    });
  }

  onNivelChange(source: 'filtro' | 'modal'): void {
    const nivelId = source === 'filtro' ? this.filtroNivel : this.nuevaMatricula.nivel;

    // Lógica para el filtro de la tabla principal
    if (source === 'filtro') {
      this.filtroGrado = ''; // Resetea el grado seleccionado
      // Filtramos la lista maestra de grados que ya cargamos al inicio
      this.gradosParaFiltro = nivelId ? this.grados.filter(g => g.nivel === nivelId) : [];
      this.buscar();
    }
    // Lógica para el modal de nueva matrícula
    else {
      this.nuevaMatricula.grado = '';
      this.gradosDelNivelSeleccionado = nivelId ? this.grados.filter(g => g.nivel === nivelId) : [];
    }
  }

  buscar(): void {
    this.currentPage = 1;
    this.loadMatriculas();
  }

  limpiarFiltros(): void {
    const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
    this.filtroNivel = '';
    this.filtroGrado = '';
    this.filtroEstado = EstadoMatriculaReference.VIGENTE;
    this.filtroBusqueda = '';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.gradosParaFiltro = [];
    this.buscar();
  }

  getEstudianteNombre(id: string): string {
    const est = this.estudiantes.find(e => e.identifier === id);
    // Concatenamos nombre, apellido paterno y materno
    return est ? `${est.nombre} ${est.apellidoPaterno} ${est.apellidoMaterno}` : '...';
  }

  getEstudianteDNI(id: string | undefined): string {
    if (!id) return '...';
    const est = this.estudiantes.find(e => e.identifier === id);
    return est ? est.dni : '...';
  }

  getNivelNombre(id: string): string {
    const niv = this.niveles.find(n => n.identifier === id);
    return niv ? niv.descripcion : '...';
  }

  getAnioAcademicoValor(id: string): number | string {
    const anio = this.anios.find(a => a.identifier === id);
    return anio ? anio.anio : 'N/A';
  }

  getGradoNombre(id: string): string {
    const grad = this.grados.find(g => g.identifier === id);
    return grad ? grad.descripcion : '...';
  }

  getApoderadoNombre(id: string): string {
    const apo = this.apoderados.find(a => a.identifier === id);
    return apo ? `${apo.nombre} ${apo.apellidoPaterno} ${apo.apellidoMaterno}` : '...';
  }

  getApoderadoDNI(id: string | undefined): string {
    if (!id) return '...';
    const apo = this.apoderados.find(a => a.identifier === id);
    return apo ? apo.dni : '...';
  }

  generarAvatarUrl(nombre: string): string {
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://placehold.co/64x64/E2E8F0/4A5568?text=${iniciales}`;
  }

  // --- Métodos para el Modal de Nueva Matrícula ---
  abrirNuevaMatriculaModal(): void {
    // 1. Primero, busca un año académico activo.
    const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');

    // 2. SI NO LO ENCUENTRA, detiene todo y le avisa al usuario.
    if (!anioActivo) {
        Swal.fire('Error de Configuración', 'No se encontró un año académico activo. Por favor, configure uno en el módulo de Años Académicos.', 'error');
        return; // No abre el modal.
    }

    // 3. Si lo encuentra, procede a crear el formulario con el año ya asignado.
    this.nuevaMatricula = {
      estudianteBusqueda: '',
      estudianteSeleccionado: null,
      apoderadoBusqueda: '',
      apoderadoSeleccionado: null,
      anioAcademico: anioActivo.identifier, // Se asigna aquí
      nivel: '',
      grado: '',
      situacion: SituacionReference.PROMOVIDO,
      procedencia: '',
      descuentoMatricula: 0,
      descuentoPension: 0
    };
    
    this.estudiantesEncontrados = [];
    this.apoderadosEncontrados = [];
    this.gradosDelNivelSeleccionado = [];
    this.showNuevaMatriculaModal = true;
  }

  cerrarNuevaMatriculaModal(): void {
    this.showNuevaMatriculaModal = false;
  }

  buscarEstudiantes(): void {
    // Determinamos si estamos en el modal de creación o de edición
    const busqueda = this.showNuevaMatriculaModal
      ? this.nuevaMatricula.estudianteBusqueda?.toLowerCase().trim()
      : this.matriculaParaEditar.estudianteBusqueda?.toLowerCase().trim();

    if (busqueda && busqueda.length > 2) {
      // --- CAMBIO AQUÍ: Se usa el nuevo método getSearchActivos ---
      this.estudianteService.getSearchActivos(0, 10, busqueda).subscribe(res => {
        this.estudiantesEncontrados = res?.content || [];
      });
    } else {
      this.estudiantesEncontrados = [];
    }
  }

  seleccionarEstudiante(estudiante: EstudianteDto): void {
    this.nuevaMatricula.estudianteSeleccionado = estudiante;
    this.nuevaMatricula.estudianteBusqueda = `${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`;
    this.estudiantesEncontrados = [];
  }

  buscarApoderados(): void {
    const busqueda = this.showNuevaMatriculaModal
      ? this.nuevaMatricula.apoderadoBusqueda?.toLowerCase().trim()
      : this.matriculaParaEditar.apoderadoBusqueda?.toLowerCase().trim();

    if (busqueda && busqueda.length > 2) {
      // --- CAMBIO AQUÍ: Se usa el nuevo método getSearchActivos ---
      this.apoderadoService.getSearchActivos(0, 10, busqueda).subscribe(res => {
        this.apoderadosEncontrados = res?.content || [];
      });
    } else {
      this.apoderadosEncontrados = [];
    }
  }

  seleccionarApoderado(apoderado: ApoderadoDto): void {
    this.nuevaMatricula.apoderadoSeleccionado = apoderado;
    this.nuevaMatricula.apoderadoBusqueda = `${apoderado.nombre} ${apoderado.apellidoPaterno} ${apoderado.apellidoMaterno}`;
    this.apoderadosEncontrados = [];
  }

  registrarMatricula(): void {

    const descMatricula = this.nuevaMatricula.descuentoMatricula || 0;
    const descPension = this.nuevaMatricula.descuentoPension || 0;

    // --- VALIDACIÓN DE DESCUENTOS ---
    if (descMatricula < 0 || descPension < 0) {
      Swal.fire('Monto Inválido', 'El descuento no puede ser un número negativo.', 'warning');
      return;
    }
    if (descMatricula > this.montoBaseMatricula) {
      Swal.fire('Monto Inválido', 'El descuento de la matrícula no puede exceder el monto base.', 'warning');
      return;
    }
    if (descPension > this.montoBasePension) {
      Swal.fire('Monto Inválido', 'El descuento de la pensión no puede exceder el monto base.', 'warning');
      return;
    }

    console.log("Datos del formulario ANTES de validar:", this.nuevaMatricula);

    if (!this.nuevaMatricula.estudianteSeleccionado || !this.nuevaMatricula.apoderadoSeleccionado ||
      !this.nuevaMatricula.anioAcademico || !this.nuevaMatricula.nivel || !this.nuevaMatricula.grado) {
      Swal.fire('Campos Incompletos', 'Por favor, complete todos los pasos requeridos.', 'warning');
      return;
    }

    // Ahora incluimos los descuentos en el objeto que se envía al backend.
    const nuevaMatriculaDto: Partial<MatriculaDto> = {
      estudiante: this.nuevaMatricula.estudianteSeleccionado.identifier,
      apoderado: this.nuevaMatricula.apoderadoSeleccionado.identifier,
      anioAcademico: this.nuevaMatricula.anioAcademico,
      nivel: this.nuevaMatricula.nivel,
      grado: this.nuevaMatricula.grado,
      situacion: this.nuevaMatricula.situacion,
      procedencia: this.nuevaMatricula.situacion === SituacionReference.INGRESANTE ? this.nuevaMatricula.procedencia : '',
      // --- LÍNEAS AÑADIDAS ---
      descuentoMatricula: this.nuevaMatricula.descuentoMatricula,
      descuentoPension: this.nuevaMatricula.descuentoPension
    };

    console.log('Datos de Matrícula a Registrar:', this.nuevaMatricula); // <-- Para ver los descuentos en consola

    // CORREGIDO: Se añade el tipo explícito 'MatriculaDto | undefined'
    this.matriculaService.add(nuevaMatriculaDto).subscribe({
      next: (matriculaCreada) => {
        if (matriculaCreada) {
          Swal.fire('¡Éxito!', `Matrícula ${matriculaCreada.codigo} registrada correctamente.`, 'success');
          this.loadMatriculas();
          this.cerrarNuevaMatriculaModal();
        }
      },
      error: (err) => {
        // --- CAMBIO AQUÍ: Se muestra el error específico del backend ---
        Swal.fire('¡Cuidado!', err.message, 'warning');
      }
    });
  }

  // --- MÉTODOS PARA EL MODAL DE DETALLE ---
  abrirDetalleModal(matricula: MatriculaDto): void {
    // --- LÓGICA DE ORDENAMIENTO MEJORADA CON DESEMPATE ---
    matricula.cronogramas.sort((a, b) => {
      const fechaA = new Date(a.fechaVencimiento).getTime();
      const fechaB = new Date(b.fechaVencimiento).getTime();

      // 1. Criterio principal: ordenar por fecha
      if (fechaA !== fechaB) {
        return fechaA - fechaB;
      }

      // 2. Criterio de desempate: si las fechas son iguales,
      // la "Matrícula" siempre va primero que la "Pensión".
      if (a.descripcion?.includes('Matrícula')) return -1;
      if (b.descripcion?.includes('Matrícula')) return 1;
      
      return 0; // Si no es ninguno de los casos, mantener el orden
    });

    this.matriculaSeleccionada = {
      ...matricula,
      avatarUrl: this.generarAvatarUrl(this.getEstudianteNombre(matricula.estudiante))
    };
    this.showDetalleModal = true;
  }

  cerrarDetalleModal(): void {
    this.showDetalleModal = false;
    this.matriculaSeleccionada = null;
  }

  // --- MÉTODOS PARA MODAL DE EDICIÓN ---
  abrirEditarModal(matricula: MatriculaDto): void {
    // --- VALIDACIÓN AÑADIDA AL INICIO ---
    if (matricula.estadoAnioAcademico === EstadoAcademicoReference.CERRADO) {
      Swal.fire('Acción no permitida', 'No se puede editar una matrícula de un año académico que ya ha sido cerrado.', 'warning');
      return; // Detiene la ejecución aquí.
    }
    
    const cuotaMatricula = matricula.cronogramas.find(c => c.descripcion?.toLowerCase().includes('matrícula'));
    const cuotaPension = matricula.cronogramas.find(c => c.descripcion?.toLowerCase().includes('pensión'));

    this.matriculaParaEditar = {
      ...matricula,
      nombreEstudiante: this.getEstudianteNombre(matricula.estudiante),
      nombreApoderado: this.getApoderadoNombre(matricula.apoderado),
      avatarUrl: this.generarAvatarUrl(this.getEstudianteNombre(matricula.estudiante)),
      descuentoMatricula: cuotaMatricula?.descuento || 0,
      descuentoPension: cuotaPension?.descuento || 0,
      editandoEstudiante: false,
      editandoApoderado: false
    };

    this.tienePagosRegistrados = matricula.cronogramas.some(c => c.estadoDeuda === EstadoDeudaReference.PAGADO);
    this.onNivelChangeEnEditar();
    this.showEditarModal = true;
  }

  // --- NUEVA FUNCIÓN PARA FILTRAR GRADOS EN EDICIÓN ---
  onNivelChangeEnEditar(): void {
    const nivelId = this.matriculaParaEditar.nivel;
    this.gradosParaEditar = nivelId ? this.grados.filter(g => g.nivel === nivelId) : [];
    // Si el grado actual no pertenece al nuevo nivel, se resetea
    if (!this.gradosParaEditar.some(g => g.identifier === this.matriculaParaEditar.grado)) {
      this.matriculaParaEditar.grado = '';
    }
  }

  // --- NUEVAS FUNCIONES PARA BOTONES "CAMBIAR" ---
  cambiarEstudianteEnEdicion(): void {
    this.matriculaParaEditar.editandoEstudiante = true;
    this.matriculaParaEditar.estudianteBusqueda = '';
    this.estudiantesEncontrados = [];
  }

  seleccionarNuevoEstudiante(estudiante: EstudianteDto): void {
    this.matriculaParaEditar.estudiante = estudiante.identifier;
    this.matriculaParaEditar.nombreEstudiante = `${estudiante.nombre} ${estudiante.apellidoPaterno}`;
    this.matriculaParaEditar.editandoEstudiante = false;
  }

  cambiarApoderadoEnEdicion(): void {
    this.matriculaParaEditar.editandoApoderado = true;
    this.matriculaParaEditar.apoderadoBusqueda = '';
    this.apoderadosEncontrados = [];
  }

  seleccionarNuevoApoderado(apoderado: ApoderadoDto): void {
    this.matriculaParaEditar.apoderado = apoderado.identifier;
    this.matriculaParaEditar.nombreApoderado = `${apoderado.nombre} ${apoderado.apellidoPaterno}`;
    this.matriculaParaEditar.editandoApoderado = false;
  }

  cerrarEditarModal(): void {
    this.showEditarModal = false;
  }

  guardarCambiosMatricula(): void {
    if (!this.matriculaParaEditar || !this.matriculaParaEditar.identifier) return;

    const descMatricula = this.matriculaParaEditar.descuentoMatricula || 0;
    const descPension = this.matriculaParaEditar.descuentoPension || 0;

    // --- VALIDACIÓN DE DESCUENTOS ---
    if (descMatricula < 0 || descPension < 0) {
      Swal.fire('Monto Inválido', 'El descuento no puede ser un número negativo.', 'warning');
      return;
    }
    if (descMatricula > this.montoBaseMatricula) {
      Swal.fire('Monto Inválido', 'El descuento de la matrícula no puede exceder el monto base.', 'warning');
      return;
    }
    if (descPension > this.montoBasePension) {
      Swal.fire('Monto Inválido', 'El descuento de la pensión no puede exceder el monto base.', 'warning');
      return;
    }

    // Creamos el DTO con todos los campos necesarios para la actualización
    const matriculaActualizada: Partial<MatriculaDto> = {
      // Campos siempre editables
      situacion: this.matriculaParaEditar.situacion,
      procedencia: this.matriculaParaEditar.procedencia,

      // Campos editables solo si no hay pagos
      estudiante: this.matriculaParaEditar.estudiante,
      apoderado: this.matriculaParaEditar.apoderado,
      nivel: this.matriculaParaEditar.nivel,
      grado: this.matriculaParaEditar.grado,
      anioAcademico: this.matriculaParaEditar.anioAcademico, // Es importante enviarlo
      descuentoMatricula: this.matriculaParaEditar.descuentoMatricula,
      descuentoPension: this.matriculaParaEditar.descuentoPension
    };

    this.matriculaService.update(this.matriculaParaEditar.identifier, matriculaActualizada)
      .subscribe({
        next: (res) => {
          if (res) {
            Swal.fire('¡Éxito!', `Matrícula ${res.codigo} actualizada.`, 'success');
            this.loadMatriculas();
            this.cerrarEditarModal();
          }
        },
        error: (err) => {
          // --- CAMBIO AQUÍ: Se muestra el error específico del backend ---
          Swal.fire('¡Cuidado!', err.message, 'warning');
        }
      });
  }

  // --- MÉTODO PARA ANULAR MATRÍCULA CON VALIDACIÓN COMPLETA ---
  confirmarAnulacion(matricula: MatriculaDto): void {
    // Validación 1: No anular si ya tiene pagos registrados (existente).
    const tienePagos = matricula.cronogramas.some(c => c.estadoDeuda === EstadoDeudaReference.PAGADO);
    if (tienePagos) {
      Swal.fire('Acción no permitida', 'No se puede anular una matrícula que ya tiene pagos registrados.', 'warning');
      return;
    }
    
    // 2. No anular si tiene deudas pendientes que ya están vencidas.
    const tieneDeudasVencidas = matricula.cronogramas.some(
        c => c.estadoDeuda === EstadoDeudaReference.VENCIDO
    );

    if (tieneDeudasVencidas) {
        Swal.fire('Acción no permitida', 'No se puede anular. La matrícula tiene deudas vencidas que deben ser canceladas.', 'warning');
        return;
    }
    
    // Si pasa ambas validaciones, se procede con la confirmación.
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se anulará la matrícula ${matricula.codigo}. Esta acción no se puede revertir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.matriculaService.anular(matricula.identifier).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Anulada', 'La matrícula ha sido anulada correctamente.', 'success');
              this.loadMatriculas();
            } else {
              Swal.fire('Error', 'No se pudo anular la matrícula.', 'error');
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message, 'error');
          }
        });
      }
    });
  }

  // --- NUEVO MÉTODO: Lógica para mostrar/ocultar el botón 'Completar' ---
  mostrarBotonCompletar(matricula: MatriculaDto): boolean {
    // No mostrar si ya está completada o anulada
    if (matricula.estado === EstadoMatriculaReference.COMPLETADA || matricula.estado === EstadoMatriculaReference.ANULADA) {
      return false;
    }

    const deudasPendientes = matricula.cronogramas.filter(c => c.estadoDeuda === EstadoDeudaReference.PENDIENTE).length;
    const deudasPagadas = matricula.cronogramas.filter(c => c.estadoDeuda === EstadoDeudaReference.PAGADO).length;

    // Caso 1: Todas las deudas están pagadas
    if (deudasPagadas === matricula.cronogramas.length) {
      return true;
    }

    // Caso 2: Hay algunas pagadas y otras pendientes (retiro)
    if (deudasPagadas > 0 && deudasPendientes > 0) {
      return true;
    }

    // No mostrar en ningún otro caso (ej. todas pendientes)
    return false;
  }

  // --- NUEVO MÉTODO: Acción al hacer clic en 'Completar' ---
  confirmarCompletar(matricula: MatriculaDto): void {
    // 1. Verificamos si aún quedan deudas pendientes
    const hayDeudasPendientes = matricula.cronogramas.some(
      c => c.estadoDeuda === EstadoDeudaReference.PENDIENTE || c.estadoDeuda === EstadoDeudaReference.VENCIDO
    );

    // 2. Definimos el mensaje dinámicamente
    let confirmationText = '';
    if (hayDeudasPendientes) {
      // Mensaje para el caso de retiro (quedan deudas por anular)
      confirmationText = `Se cambiará el estado a COMPLETADA y las deudas pendientes se anularán. Esta acción no se puede revertir.`;
    } else {
      // Mensaje para el caso de finalización (todas las deudas están pagadas)
      confirmationText = `Todas las deudas han sido pagadas. Se marcará la matrícula ${matricula.codigo} como COMPLETADA para finalizar el proceso académico del año.`;
    }

    // 3. Mostramos la alerta con el mensaje correcto
    Swal.fire({
      title: '¿Completar Matrícula?',
      text: confirmationText, // Usamos el texto dinámico
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, completar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.matriculaService.completar(matricula.identifier).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('¡Éxito!', 'La matrícula ha sido marcada como completada.', 'success');
              this.loadMatriculas();
              this.cerrarDetalleModal();
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message, 'error');
          }
        });
      }
    });
  }

  // --- Paginación ---
  setPage(page: number): void {
    if (page < 1 || (this.pagedMatriculas && page > this.pagedMatriculas.totalPages)) return;
    this.currentPage = page;
    this.loadMatriculas();
  }

  getPagesArray(): number[] {
    if (!this.pagedMatriculas) return [];
    return Array(this.pagedMatriculas.totalPages).fill(0).map((x, i) => i + 1);
  }
}