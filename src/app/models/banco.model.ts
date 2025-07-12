import { EstadoReference } from "./enums/estado-reference.enum";
import { PagoDto } from "./pago.model";

export interface BancoDto {
  identifier: string;
  codigo: string;
  descripcion: string;
  estado: EstadoReference;
  fechaCreacion: string;
  pagos: PagoDto[];
}