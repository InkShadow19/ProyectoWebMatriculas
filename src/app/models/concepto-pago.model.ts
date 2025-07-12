import { CronogramaPagoDto } from "./cronograma-pago.model";
import { EstadoReference } from "./enums/estado-reference.enum";

export interface ConceptoPagoDto {
  identifier: string;
  codigo: string;
  descripcion: string;
  montoSugerido: number;
  estado: EstadoReference;
  fechaCreacion: string;
  cronogramas: CronogramaPagoDto[];
}