export interface PagoDetalleDto {
  identifier: string;
  montoAplicado: number;
  habilitado: boolean;
  fechaCreacion: string;
  cronograma: string; // Identifier
  pago: string; // Identifier
}