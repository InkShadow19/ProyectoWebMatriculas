import { CanalReference } from "./enums/canal-reference.enum";
import { PagoDetalleDto } from "./pago-detalle.model";

export interface PagoDto {
  identifier: string;
  canalPago: CanalReference;
  numeroTicket?: string;
  montoTotalPagado: number;
  fechaPago: string;
  habilitado: boolean;
  fechaCreacion: string;
  usuario: string; // Identifier
  banco?: string; // Identifier, opcional porque banco_id puede ser NULL
  detalles: PagoDetalleDto[];
}