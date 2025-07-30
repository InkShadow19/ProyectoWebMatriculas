import { CanalReference } from "./enums/canal-reference.enum";
import { EstadoPagoReference } from "./enums/estado-pago-reference.enum";
import { PagoDetalleDto } from "./pago-detalle.model";

export interface PagoDto {
  identifier: string;
  canalPago: CanalReference;
  numeroTicket?: string;
  montoTotalPagado: number;
  fechaPago: string;
  estado: EstadoPagoReference;
  fechaCreacion: string;
  usuario: string; // Identifier
  banco?: string; // Identifier, opcional porque banco_id puede ser NULL
  detalles: PagoDetalleDto[];

  // --- CAMPOS AÑADIDOS PARA SINCRONIZAR CON EL BACKEND ---
  nombreEstudiante?: string;
  nombreUsuario?: string;

}