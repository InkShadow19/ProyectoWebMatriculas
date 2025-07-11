import { EstadoDeudaReference } from "./enums/estado-deuda-reference.enum";
import { PagoDetalleDto } from "./pago-detalle.model";

export interface CronogramaPagoDto {
  identifier: string;
  descripcionPersonalizada?: string;
  montoOriginal: number;
  descuento: number;
  mora: number;
  montoAPagar: number;
  fechaVencimiento: string;
  estadoDeuda: EstadoDeudaReference;
  habilitado: boolean;
  fechaCreacion: string;
  matricula: string; // Identifier
  conceptoPago: string; // Identifier
  detalles: PagoDetalleDto[];
}