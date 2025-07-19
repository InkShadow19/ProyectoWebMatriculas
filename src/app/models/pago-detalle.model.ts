import { EstadoReference } from "./enums/estado-reference.enum";

export interface PagoDetalleDto {
  identifier: string;
  montoAplicado: number;
  estado: EstadoReference;
  fechaCreacion: string;
  cronograma: string; // Identifier
  pago: string; // Identifier
}