import { PagoDto } from "./pago.model";

export interface BancoDto {
  identifier: string;
  codigo: string;
  descripcion: string;
  habilitado: boolean;
  fechaCreacion: string;
  pagos: PagoDto[];
}