import { Component, OnInit, ChangeDetectorRef, LOCALE_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe, registerLocaleData } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/_metronic/shared/shared.module';
import { PagoDto } from 'src/app/models/pago.model';
import { CanalReference } from 'src/app/models/enums/canal-reference.enum';
import { CronogramaPagoDto } from 'src/app/models/cronograma-pago.model';
import { EstadoDeudaReference } from 'src/app/models/enums/estado-deuda-reference.enum';
import { EstadoPagoReference } from 'src/app/models/enums/estado-pago-reference.enum';
import { PageResponse } from 'src/app/models/page-response.model';
import { PagoService } from 'src/app/services/pago.service';
import { BancoService } from 'src/app/services/banco.service';
import { BancoDto } from 'src/app/models/banco.model';
import { EstudianteService } from 'src/app/services/estudiante.service';
import Swal from 'sweetalert2';
import { EstudianteDto } from 'src/app/models/estudiante.model';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import localeEs from '@angular/common/locales/es-PE';

// Interfaces para la vista
interface DeudaPendiente extends CronogramaPagoDto {
  seleccionado?: boolean;
}

registerLocaleData(localeEs, 'es-PE');

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, CurrencyPipe, DatePipe, NgbDropdownModule],
  templateUrl: './pagos.component.html',
  styleUrls: ['./pagos.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'es-PE' }]
})
export class PagosComponent implements OnInit {

  // --- Estado de la Vista Principal ---
  pagedPagos: PageResponse<PagoDto> | undefined;
  filtros = { fechaDesde: '', fechaHasta: '', canal: '', estado: EstadoPagoReference.CONFIRMADO, busqueda: '' };
  currentPage: number = 1;
  itemsPerPage: number = 5;;

  // --- Enums para el HTML ---
  CanalReference = CanalReference;
  EstadoPagoReference = EstadoPagoReference;

  // --- Estado del Modal "Registrar Pago" ---
  showRegistrarPagoModal = false;
  procesoPagoPaso: 'busqueda' | 'seleccion' = 'busqueda';
  busquedaEstudiante: string = '';
  estudiantesEncontrados: EstudianteDto[] = []; // Para la lista de búsqueda
  estudianteSeleccionado: { identifier: string; nombre: string; deudas: DeudaPendiente[] } | null = null;

  nuevoPago = { canal: CanalReference.CAJA, bancoId: '', numeroOperacion: '', fechaPago: new Date().toISOString().split('T')[0], montoTotal: 0 };
  bancos: BancoDto[] = [];

  // --- Estado del Modal "Ver Detalle" ---
  showDetallePagoModal = false;
  pagoSeleccionado: PagoDto | null = null;

  constructor(
    private cdr: ChangeDetectorRef,
    private pagoService: PagoService,
    private bancoService: BancoService,
    private estudianteService: EstudianteService
  ) { }

  ngOnInit(): void {
    this.loadPagos();
    this.loadBancos();
  }

  loadBancos(): void {
    this.bancoService.getList(0, 100).subscribe(res => {
      this.bancos = res?.content || [];
    });
  }

  loadPagos(): void {
    const page = this.currentPage - 1;
    this.pagoService.getList(
      page,
      this.itemsPerPage,
      this.filtros.estado,
      this.filtros.canal,
      this.filtros.busqueda,
      undefined, // monto (no se usa en este filtro)
      this.filtros.fechaDesde,
      this.filtros.fechaHasta
    ).subscribe(response => {
      this.pagedPagos = response;
      this.cdr.detectChanges();
    });
  }

  filtrarPagos(): void {
    this.currentPage = 1;
    this.loadPagos();
  }

  limpiarFiltros(): void {
    this.filtros = {
      fechaDesde: '',
      fechaHasta: '',
      canal: '',
      estado: EstadoPagoReference.CONFIRMADO,
      busqueda: ''
    };
    this.filtrarPagos();
  }

  // --- Lógica de Paginación ---
  setPage(page: number): void {
    if (page < 1 || (this.pagedPagos && page > this.pagedPagos.totalPages)) {
      return;
    }
    this.currentPage = page;
    this.loadPagos();
  }

  getPagesArray(): number[] {
    if (!this.pagedPagos || this.pagedPagos.totalPages === 0) return [];
    return Array(this.pagedPagos.totalPages).fill(0).map((x, i) => i + 1);
  }

  // --- Lógica del Modal "Registrar Pago" (Actualizada) ---
  abrirRegistrarPagoModal(): void { this.showRegistrarPagoModal = true; this.resetearProcesoPago(); this.onCanalPagoChange(); }
  cerrarRegistrarPagoModal(): void { this.showRegistrarPagoModal = false; }
  resetearProcesoPago(): void {
    this.procesoPagoPaso = 'busqueda';
    this.busquedaEstudiante = '';
    this.estudianteSeleccionado = null;
    this.estudiantesEncontrados = [];
    this.nuevoPago = { canal: CanalReference.CAJA, bancoId: '', numeroOperacion: '', fechaPago: new Date().toISOString().split('T')[0], montoTotal: 0 };
  }

  buscarEstudiante(): void {
    if (!this.busquedaEstudiante || this.busquedaEstudiante.length < 3) {
      this.estudiantesEncontrados = [];
      return;
    }
    this.estudianteService.getList(0, 5, this.busquedaEstudiante).subscribe(res => {
      this.estudiantesEncontrados = res?.content || [];
    });
  }

  seleccionarEstudiante(estudiante: EstudianteDto): void {
    this.busquedaEstudiante = `${estudiante.nombre} ${estudiante.apellidoPaterno} ${estudiante.apellidoMaterno}`;
    this.estudiantesEncontrados = [];

    this.pagoService.getDeudasPendientes(estudiante.identifier).subscribe(deudas => {
      const deudasPendientes = deudas?.filter(d => d.estadoDeuda === EstadoDeudaReference.PENDIENTE || d.estadoDeuda === EstadoDeudaReference.VENCIDO) || [];
      if (deudasPendientes.length === 0) {
        Swal.fire(
          'No hay cuotas para pagar',
          `El estudiante no tiene un cronograma de pagos activo o ya ha cancelado todas sus deudas pendientes.`,
          'info'
        );
        this.resetearProcesoPago();
        return;
      }

      // --- LÓGICA DE ORDENAMIENTO MEJORADA CON DESEMPATE ---
      deudasPendientes.sort((a, b) => {
        const fechaA = new Date(a.fechaVencimiento).getTime();
        const fechaB = new Date(b.fechaVencimiento).getTime();

        // 1. Criterio principal: ordenar por fecha
        if (fechaA !== fechaB) {
          return fechaA - fechaB;
        }

        // 2. Criterio de desempate: si las fechas son iguales,
        // la "Matrícula" siempre va primero.
        if (a.descripcion?.includes('Matrícula')) return -1;
        if (b.descripcion?.includes('Matrícula')) return 1;

        return 0;
      });

      this.estudianteSeleccionado = {
        identifier: estudiante.identifier,
        nombre: this.busquedaEstudiante,
        deudas: deudasPendientes.map(d => ({ ...d, seleccionado: false }))
      };

      this.procesoPagoPaso = 'seleccion';
      this.cdr.detectChanges();
    });
  }

  calcularTotal(): void {
    if (!this.estudianteSeleccionado) return;
    this.nuevoPago.montoTotal = this.estudianteSeleccionado.deudas
      .filter(d => d.seleccionado)
      .reduce((sum, d) => sum + (d.montoAPagar || 0), 0);
  }

  // --- MÉTODO DE REGISTRO IMPLEMENTADO ---
  registrarPago(): void {
    if (!this.estudianteSeleccionado || this.nuevoPago.montoTotal <= 0) {
      Swal.fire('Datos Incompletos', 'Debe seleccionar al menos una deuda para pagar.', 'warning');
      return;
    }
    if (this.nuevoPago.canal === CanalReference.BANCO && !this.nuevoPago.bancoId) {
      Swal.fire('Datos Incompletos', 'Por favor, seleccione un banco.', 'warning');
      return;
    }

    const detallesParaEnviar = this.estudianteSeleccionado.deudas
      .filter(d => d.seleccionado)
      .map(deuda => ({
        cronograma: deuda.identifier,
        montoAplicado: deuda.montoAPagar
      }));

    const pagoParaEnviar: Partial<PagoDto> = {
      canalPago: this.nuevoPago.canal,
      banco: this.nuevoPago.bancoId || undefined,
      numeroTicket: this.nuevoPago.numeroOperacion,
      montoTotalPagado: this.nuevoPago.montoTotal,
      detalles: detallesParaEnviar
    };

    this.pagoService.add(pagoParaEnviar).subscribe({
      next: (pagoCreado) => {
        if (pagoCreado) {
          Swal.fire('¡Éxito!', `El pago con ticket #${pagoCreado.numeroTicket} se registró correctamente.`, 'success');
          this.loadPagos();
          this.cerrarRegistrarPagoModal();
        }
      },
      error: (err) => {
        Swal.fire('Error al Registrar', err.message, 'error');
      }
    });
  }

  // --- Lógica del Modal "Ver Detalle" ---
  getNombreBanco(bancoId: string | undefined): string {
    if (!bancoId) return 'N/A';
    const banco = this.bancos.find(b => b.identifier === bancoId);
    return banco ? banco.descripcion : 'Desconocido';
  }

  abrirDetallePago(pago: PagoDto): void {
    this.pagoSeleccionado = pago;
    this.showDetallePagoModal = true;
  }

  cerrarDetallePago(): void {
    this.showDetallePagoModal = false;
    this.pagoSeleccionado = null;
  }

  // --- MÉTODO NUEVO: Se ejecuta al cambiar el canal de pago ---
  onCanalPagoChange(): void {
    if (this.nuevoPago.canal === CanalReference.CAJA) {
      this.pagoService.getNextCajaTicket().subscribe(ticket => {
        if (ticket) {
          this.nuevoPago.numeroOperacion = ticket;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.nuevoPago.numeroOperacion = '';
    }
  }

  // --- NUEVO MÉTODO PARA CONFIRMAR LA ANULACIÓN ---
  confirmarAnulacionPago(pago: PagoDto): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Se anulará el pago con Ticket #${pago.numeroTicket}. Las deudas asociadas volverán a estar pendientes.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, anular pago',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.pagoService.anular(pago.identifier).subscribe({
          next: (success) => {
            if (success) {
              Swal.fire('Anulado', 'El pago ha sido anulado correctamente.', 'success');
              this.loadPagos(); // Recargar la tabla
            }
          },
          error: (err) => {
            Swal.fire('Error', err.message, 'error');
          }
        });
      }
    });
  }

  // --- NUEVO MÉTODO PARA MANEJAR LA DESCARGA ---
  imprimirPago(pago: PagoDto): void {
    this.pagoService.imprimirBoleta(pago.identifier).subscribe(blob => {
      if (blob) {
        // Se crea una URL temporal para el archivo PDF en el navegador
        const fileURL = URL.createObjectURL(blob);
        // Se abre la URL en una nueva pestaña para previsualizar o imprimir
        window.open(fileURL, '_blank');
      }
    });
  }
}