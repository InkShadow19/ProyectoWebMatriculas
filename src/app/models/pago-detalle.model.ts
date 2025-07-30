import { EstadoReference } from "./enums/estado-reference.enum";

export interface PagoDetalleDto {
  identifier?: string;       // Opcional: El backend lo genera
  montoAplicado: number;     // Requerido: Lo enviamos desde el frontend
  estado?: EstadoReference;  // Opcional: El backend lo gestiona
  fechaCreacion?: string;    // Opcional: El backend lo genera
  cronograma: string;        // Requerido: Lo enviamos desde el frontend (es el ID de la deuda)
  pago?: string;             // Opcional: El backend lo relaciona
  descripcionCronograma?: string;
}