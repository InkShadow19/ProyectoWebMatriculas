import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { PagoDto } from 'src/app/models/pago.model';
import { CanalReference } from 'src/app/models/enums/canal-reference.enum';
import { CronogramaPagoDto } from 'src/app/models/cronograma-pago.model';
import { EstadoDeudaReference } from 'src/app/models/enums/estado-deuda-reference.enum';
import { EstadoPagoReference } from 'src/app/models/enums/estado-pago-reference.enum';

// Interfaces para la vista
interface PagoMostrado extends PagoDto {
  estudiante: string;
  registradoPor: string; // Nombre del usuario
  estado: EstadoPagoReference;
}

interface DeudaPendiente extends CronogramaPagoDto {
  seleccionado?: boolean;
}

interface Banco {
  id: string;
  nombre: string;
}

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CurrencyPipe, DatePipe],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss']
})
export class PagosComponent implements OnInit {

  // --- Estado de la Vista Principal ---
  pagos: PagoMostrado[] = [];
  pagosFiltrados: PagoMostrado[] = [];
  filtros = {
    fechaDesde: '',
    fechaHasta: '',
    canal: '',
    estado: '',
    busqueda: ''
  };

  // --- Paginación ---
  currentPage: number = 1;
  itemsPerPage: number = 5; // Puedes ajustar este número
  pagedPagos: PagoMostrado[] = [];
  pagesArray: number[] = [];

  // --- Estado del Modal "Registrar Pago" ---
  showRegistrarPagoModal = false;
  procesoPagoPaso: 'busqueda' | 'seleccion' = 'busqueda';
  busquedaEstudiante: string = '';
  estudianteEncontrado: { nombre: string, deudas: DeudaPendiente[] } | null = null;
  nuevoPago = {
    canal: CanalReference.CAJA,
    bancoId: '', // Nuevo campo para el banco
    numeroOperacion: '',
    fechaPago: new Date().toISOString().split('T')[0],
    montoTotal: 0
  };
  bancos: Banco[] = [
      { id: 'bcp', nombre: 'Banco de Crédito del Perú' },
      { id: 'interbank', nombre: 'Interbank' },
      { id: 'bbva', nombre: 'BBVA Continental' },
      { id: 'scotiabank', nombre: 'Scotiabank' }
  ];


  // --- Estado del Modal "Ver Detalle" ---
  showDetallePagoModal = false;
  pagoSeleccionado: PagoMostrado | null = null;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarPagosDeEjemplo();
    this.filtrarPagos();
  }

  cargarPagosDeEjemplo() {
    this.pagos = [
      { identifier: 'p-1', numeroTicket: 'V-0015', fechaPago: '2025-07-04T10:30:00Z', estudiante: 'Sofía Torres Rojas', montoTotalPagado: 580.00, canalPago: CanalReference.CAJA, usuario: 'usr-1', registradoPor: 'Ana Pérez', estado: EstadoPagoReference.CONFIRMADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-2', numeroTicket: '987654', fechaPago: '2025-07-03T15:15:00Z', estudiante: 'Lucas Campos Díaz', montoTotalPagado: 300.00, canalPago: CanalReference.BANCO, usuario: 'usr-1', registradoPor: 'Ana Pérez', banco: 'bcp', estado: EstadoPagoReference.CONFIRMADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-3', numeroTicket: 'V-0013', fechaPago: '2025-07-02T11:00:00Z', estudiante: 'Ana Quispe Flores', montoTotalPagado: 300.00, canalPago: CanalReference.CAJA, usuario: 'usr-2', registradoPor: 'Luis Gómez', estado: EstadoPagoReference.ANULADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-4', numeroTicket: 'V-0016', fechaPago: '2025-07-05T09:00:00Z', estudiante: 'Mario Vargas Llosa', montoTotalPagado: 450.00, canalPago: CanalReference.CAJA, usuario: 'usr-1', registradoPor: 'Ana Pérez', estado: EstadoPagoReference.CONFIRMADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-5', numeroTicket: 'V-0017', fechaPago: '2025-07-06T12:00:00Z', estudiante: 'Juana de Arco', montoTotalPagado: 150.00, canalPago: CanalReference.CAJA, usuario: 'usr-2', registradoPor: 'Luis Gómez', estado: EstadoPagoReference.ANULADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-6', numeroTicket: '987655', fechaPago: '2025-07-07T14:00:00Z', estudiante: 'Pedro Castillo', montoTotalPagado: 600.00, canalPago: CanalReference.BANCO, usuario: 'usr-1', registradoPor: 'Ana Pérez', banco: 'interbank', estado: EstadoPagoReference.CONFIRMADO, fechaCreacion: '', detalles: [] },
      { identifier: 'p-7', numeroTicket: 'V-0018', fechaPago: '2025-07-08T16:00:00Z', estudiante: 'Alan García Pérez', montoTotalPagado: 250.00, canalPago: CanalReference.CAJA, usuario: 'usr-2', registradoPor: 'Luis Gómez', estado: EstadoPagoReference.ANULADO, fechaCreacion: '', detalles: [] }
    ];
  }

  filtrarPagos(): void {
    let data = [...this.pagos];
    const busquedaLower = this.filtros.busqueda.toLowerCase().trim();

    this.pagosFiltrados = data.filter(p => {
        const matchBusqueda = !this.filtros.busqueda || p.estudiante.toLowerCase().includes(busquedaLower) || p.numeroTicket?.toLowerCase().includes(busquedaLower);
        const matchCanal = !this.filtros.canal || p.canalPago === this.filtros.canal;
        const matchEstado = !this.filtros.estado || p.estado === this.filtros.estado;
        const matchFecha = (!this.filtros.fechaDesde || !this.filtros.fechaHasta) || (p.fechaPago >= this.filtros.fechaDesde && p.fechaPago <= this.filtros.fechaHasta + 'T23:59:59Z');
        
        return matchBusqueda && matchCanal && matchEstado && matchFecha;
    });

    // Resetear a la primera página después de filtrar
    this.setPage(1);
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      canal: '',
      estado: '',
      busqueda: ''
    };
    this.filtrarPagos();
  }
  
  // --- Lógica de Paginación ---
  getTotalPages(): number {
    return Math.ceil(this.pagosFiltrados.length / this.itemsPerPage);
  }

  setPage(page: number): void {
    const totalPages = this.getTotalPages();
    if (page < 1 || page > totalPages) {
      if (this.pagedPagos.length === 0 && totalPages > 0) {
          page = totalPages;
      } else {
          return;
      }
    }
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    this.pagedPagos = this.pagosFiltrados.slice(startIndex, startIndex + this.itemsPerPage);
    this.pagesArray = Array(totalPages).fill(0).map((x, i) => i + 1);
    this.cdr.detectChanges();
  }

  abrirRegistrarPagoModal(): void {
    this.showRegistrarPagoModal = true;
    this.resetearProcesoPago();
  }
  
  cerrarRegistrarPagoModal(): void {
    this.showRegistrarPagoModal = false;
  }
  
  resetearProcesoPago(): void {
    this.procesoPagoPaso = 'busqueda';
    this.busquedaEstudiante = '';
    this.estudianteEncontrado = null;
    this.nuevoPago = {
      canal: CanalReference.CAJA,
      bancoId: '',
      numeroOperacion: '',
      fechaPago: new Date().toISOString().split('T')[0],
      montoTotal: 0
    };
  }

  buscarEstudiante(): void {
    if (!this.busquedaEstudiante) return;
    this.estudianteEncontrado = {
      nombre: 'Sofía Torres Rojas',
      deudas: [
        { identifier: 'c-1', descripcion: 'Matrícula 2025', fechaVencimiento: '2025-02-28', montoAPagar: 230.00, estadoDeuda: EstadoDeudaReference.PENDIENTE, seleccionado: false, montoOriginal: 230, descuento: 0, mora: 0, fechaCreacion: '', matricula: '', conceptoPago: '', detalles: [] },
        { identifier: 'c-2', descripcion: 'Pensión Marzo 2025', fechaVencimiento: '2025-03-31', montoAPagar: 300.00, estadoDeuda: EstadoDeudaReference.PENDIENTE, seleccionado: false, montoOriginal: 300, descuento: 0, mora: 0, fechaCreacion: '', matricula: '', conceptoPago: '', detalles: [] },
        { identifier: 'c-3', descripcion: 'Pensión Abril 2025 (con mora)', fechaVencimiento: '2025-04-30', montoAPagar: 310.00, estadoDeuda: EstadoDeudaReference.VENCIDO, seleccionado: false, montoOriginal: 300, descuento: 0, mora: 10, fechaCreacion: '', matricula: '', conceptoPago: '', detalles: [] }
      ]
    };
    this.procesoPagoPaso = 'seleccion';
    this.calcularTotal();
  }

  calcularTotal(): void {
    if (!this.estudianteEncontrado) return;
    this.nuevoPago.montoTotal = this.estudianteEncontrado.deudas
      .filter(d => d.seleccionado)
      .reduce((sum, d) => sum + d.montoAPagar, 0);
  }

  registrarPago(): void {
    console.log('Pago a registrar:', this.nuevoPago);
    console.log('Deudas seleccionadas:', this.estudianteEncontrado?.deudas.filter(d => d.seleccionado));
    this.cerrarRegistrarPagoModal();
  }

  /**
   * Busca el nombre de un banco a partir de su ID.
   * @param bancoId El ID del banco a buscar.
   * @returns El nombre del banco o 'No especificado' si no se encuentra.
   */
  getNombreBanco(bancoId: string | undefined): string {
    if (!bancoId) {
      return 'No especificado';
    }
    const bancoEncontrado = this.bancos.find(b => b.id === bancoId);
    return bancoEncontrado ? bancoEncontrado.nombre : 'ID no encontrado';
  }
  
  abrirDetallePago(pago: PagoMostrado): void {
    this.pagoSeleccionado = pago;
    this.showDetallePagoModal = true;
  }
  
  cerrarDetallePago(): void {
    this.showDetallePagoModal = false;
    this.pagoSeleccionado = null;
  }
}