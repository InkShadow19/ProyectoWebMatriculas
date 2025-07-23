import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
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
}

@Component({
  selector: 'app-matriculas',
  standalone: true,
  imports: [CommonModule, SharedModule, FormsModule, RouterModule],
  templateUrl: './matriculas.component.html',
  styleUrls: ['./matriculas.component.scss']
})
export class MatriculasComponent implements OnInit {
  pagedMatriculas: PageResponse<MatriculaDto> | undefined;

  // Listas de datos
  anios: AnioAcademicoDto[] = [];
  niveles: NivelDto[] = [];
  grados: GradoDto[] = [];
  estudiantes: EstudianteDto[] = [];
  apoderados: ApoderadoDto[] = [];

  // Modelos de los filtros
  filtroAnio: string = '';
  filtroNivel: string = '';
  filtroGrado: string = '';
  filtroEstado: string = '';
  filtroBusqueda: string = '';

  gradosParaFiltro: GradoDto[] = []; // Lista de grados para el dropdown del filtro

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // Enums
  SituacionReference = SituacionReference;
  EstadoMatriculaReference = EstadoMatriculaReference;
  EstadoDeudaReference = EstadoDeudaReference; // Añadido para el modal de detalle
  situaciones: string[] = Object.values(SituacionReference);

  // --- LÓGICA PARA EL MODAL DE NUEVA MATRÍCULA ---
  showNuevaMatriculaModal = false;
  nuevaMatricula: Partial<NuevaMatriculaForm> = {};
  estudiantesEncontrados: EstudianteDto[] = [];
  apoderadosEncontrados: ApoderadoDto[] = [];
  gradosDelNivelSeleccionado: GradoDto[] = [];

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
    private apoderadoService: ApoderadoService
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
      apoderados: this.apoderadoService.getList(0, 1000)
    }).subscribe(({ anios, niveles, grados, estudiantes, apoderados }) => {
      this.anios = anios?.content || [];
      this.niveles = niveles?.content || [];
      this.grados = grados?.content || []; // Guardar todos los grados
      this.estudiantes = estudiantes?.content || [];
      this.apoderados = apoderados?.content || [];

      const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
      if (anioActivo && anioActivo.identifier) {
        this.filtroAnio = anioActivo.identifier;
      }

      this.loadMatriculas();
    });
  }

  /*loadMatriculas(): void {
    const page = this.currentPage - 1;
    this.matriculaService.getList(page, this.itemsPerPage, this.filtroBusqueda, undefined, this.filtroEstado)
      .subscribe(response => {
        this.pagedMatriculas = response;
        this.cdr.detectChanges();
      });
  }*/

  // --- MÉTODO CORREGIDO ---
  loadMatriculas(): void {
    const page = this.currentPage - 1;
    
    this.matriculaService.getList(
        page, 
        this.itemsPerPage, 
        this.filtroBusqueda, 
        this.filtroEstado,
        this.filtroAnio,
        this.filtroNivel,
        this.filtroGrado
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
    }
    // Lógica para el modal de nueva matrícula
    else {
      this.nuevaMatricula.grado = '';
      this.gradosDelNivelSeleccionado = nivelId ? this.grados.filter(g => g.nivel === nivelId) : [];
    }

    if (source === 'filtro') this.buscar();
  }

  buscar(): void {
    this.currentPage = 1;
    this.loadMatriculas();
  }

  limpiarFiltros(): void {
    const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
    this.filtroAnio = anioActivo?.identifier || '';
    this.filtroNivel = '';
    this.filtroGrado = '';
    this.filtroEstado = '';
    this.filtroBusqueda = '';
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

  generarAvatarUrl(nombre: string): string {
    const iniciales = nombre.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    return `https://placehold.co/64x64/E2E8F0/4A5568?text=${iniciales}`;
  }

  // --- Métodos para el Modal de Nueva Matrícula ---
  abrirNuevaMatriculaModal(): void {
    this.nuevaMatricula = {
      estudianteBusqueda: '',
      estudianteSeleccionado: null,
      apoderadoBusqueda: '',
      apoderadoSeleccionado: null,
      situacion: SituacionReference.PROMOVIDO,
      procedencia: '',
      descuentoMatricula: 0,
      descuentoPension: 0
      
    };
    const anioActivo = this.anios.find(a => a.estadoAcademico === 'ACTIVO');
    if (anioActivo) {
      this.nuevaMatricula.anioAcademico = anioActivo.identifier;
    }
    this.estudiantesEncontrados = [];
    this.apoderadosEncontrados = [];
    this.gradosDelNivelSeleccionado = [];
    this.showNuevaMatriculaModal = true;
  }

  cerrarNuevaMatriculaModal(): void {
    this.showNuevaMatriculaModal = false;
  }

  buscarEstudiantes(): void {
    const busqueda = this.nuevaMatricula.estudianteBusqueda?.toLowerCase().trim();
    if (busqueda && busqueda.length > 2) {
      this.estudianteService.getList(0, 10, busqueda).subscribe(res => {
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
    const busqueda = this.nuevaMatricula.apoderadoBusqueda?.toLowerCase().trim();
    if (busqueda && busqueda.length > 2) {
      this.apoderadoService.getList(0, 10, busqueda).subscribe(res => {
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
    if (!this.nuevaMatricula.estudianteSeleccionado || !this.nuevaMatricula.apoderadoSeleccionado ||
      !this.nuevaMatricula.anioAcademico || !this.nuevaMatricula.nivel || !this.nuevaMatricula.grado) {
      Swal.fire('Campos Incompletos', 'Por favor, complete todos los pasos requeridos.', 'warning');
      return;
    }

    const nuevaMatriculaDto: Partial<MatriculaDto> = {
      estudiante: this.nuevaMatricula.estudianteSeleccionado.identifier,
      apoderado: this.nuevaMatricula.apoderadoSeleccionado.identifier,
      anioAcademico: this.nuevaMatricula.anioAcademico,
      nivel: this.nuevaMatricula.nivel,
      grado: this.nuevaMatricula.grado,
      situacion: this.nuevaMatricula.situacion,
      procedencia: this.nuevaMatricula.situacion === SituacionReference.INGRESANTE ? this.nuevaMatricula.procedencia : ''
      // Aquí, en el futuro, podrías pasar los descuentos al DTO si el backend los necesita
    };

    console.log('Datos de Matrícula a Registrar:', this.nuevaMatricula); // <-- Para ver los descuentos en consola

    // CORREGIDO: Se añade el tipo explícito 'MatriculaDto | undefined'
    this.matriculaService.add(nuevaMatriculaDto).subscribe((matriculaCreada: MatriculaDto | undefined) => {
      if (matriculaCreada) {
        Swal.fire('¡Éxito!', `Matrícula ${matriculaCreada.codigo} registrada correctamente.`, 'success');
        this.loadMatriculas();
        this.cerrarNuevaMatriculaModal();
      } else {
        Swal.fire('Error', 'No se pudo registrar la matrícula.', 'error');
      }
    });
  }

  // --- MÉTODOS PARA EL MODAL DE DETALLE ---
  abrirDetalleModal(matricula: MatriculaDto): void {
    // Ordenamos el cronograma por fecha de vencimiento
    matricula.cronogramas.sort((a, b) => new Date(a.fechaVencimiento).getTime() - new Date(b.fechaVencimiento).getTime());

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
    this.matriculaParaEditar = {
      ...matricula,
      nombreEstudiante: this.getEstudianteNombre(matricula.estudiante),
      nombreApoderado: this.getApoderadoNombre(matricula.apoderado),
      avatarUrl: this.generarAvatarUrl(this.getEstudianteNombre(matricula.estudiante))
    };

    this.tienePagosRegistrados = matricula.cronogramas.some(
      c => c.estadoDeuda === EstadoDeudaReference.PAGADO
    );

    this.showEditarModal = true;
  }

  cerrarEditarModal(): void {
    this.showEditarModal = false;
  }

  guardarCambiosMatricula(): void {
    if (!this.matriculaParaEditar || !this.matriculaParaEditar.identifier) return;

    // Creamos un DTO limpio con solo los campos que el backend espera
    const matriculaActualizada: Partial<MatriculaDto> = {
      situacion: this.matriculaParaEditar.situacion,
      procedencia: this.matriculaParaEditar.procedencia,
      // Si no hay pagos, también podríamos actualizar otros campos
      // nivel: this.tienePagosRegistrados ? undefined : this.matriculaParaEditar.nivel,
    };

    // Si no hay pagos, también se pueden actualizar otros campos (esta lógica es manejada en el backend)
    if (!this.tienePagosRegistrados) {
      matriculaActualizada.nivel = this.matriculaParaEditar.nivel;
      matriculaActualizada.grado = this.matriculaParaEditar.grado;
    }

    this.matriculaService.update(this.matriculaParaEditar.identifier, matriculaActualizada)
      .subscribe(matriculaActualizada => {
        if (matriculaActualizada) {
          Swal.fire('¡Éxito!', `Matrícula ${matriculaActualizada.codigo} actualizada.`, 'success');
          this.loadMatriculas(); // Recargar la tabla
          this.cerrarEditarModal();
        } else {
          Swal.fire('Error', 'No se pudo actualizar la matrícula.', 'error');
        }
      }
      );

    /*this.matriculaService.update(this.matriculaParaEditar.identifier, matriculaActualizada)
      .subscribe(res => {
        if (res) {
          Swal.fire('¡Éxito!', `Matrícula ${res.codigo} actualizada.`, 'success');
          this.loadMatriculas();
          this.cerrarEditarModal();
        } else {
          Swal.fire('Error', 'No se pudo actualizar la matrícula.', 'error');
        }
      }
    );*/
  }

  // --- MÉTODO PARA ANULAR MATRÍCULA (LÓGICA INICIAL) ---
  confirmarAnulacion(matricula: MatriculaDto): void {
    // Primero, verificamos si se puede anular
    const tienePagos = matricula.cronogramas.some(c => c.estadoDeuda === EstadoDeudaReference.PAGADO);
    if (tienePagos) {
      Swal.fire('Acción no permitida', 'No se puede anular una matrícula que ya tiene pagos registrados.', 'warning');
      return;
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se anulará la matrícula ${matricula.codigo}. Esta acción no se puede revertir.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Llamamos al servicio para actualizar el estado
        const matriculaAnulada: Partial<MatriculaDto> = { estado: EstadoMatriculaReference.ANULADA };
        this.matriculaService.update(matricula.identifier, matriculaAnulada).subscribe(success => {
          if (success) {
            Swal.fire('Anulada', 'La matrícula ha sido anulada correctamente.', 'success');
            this.loadMatriculas();
          } else {
            Swal.fire('Error', 'No se pudo anular la matrícula.', 'error');
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