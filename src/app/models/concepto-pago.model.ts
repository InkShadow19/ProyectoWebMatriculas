import { CronogramaPagoDto } from "./cronograma-pago.model";

export interface ConceptoPagoDto {
  identifier: string;
  codigo: string;
  descripcion: string;
  montoSugerido: number;
  habilitado: boolean;
  fechaCreacion: string;
  cronogramas: CronogramaPagoDto[];
}