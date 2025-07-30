import { CronogramaPagoDto } from "./cronograma-pago.model";
import { EstadoMatriculaReference } from "./enums/estado-matricula-reference.enum";
import { SituacionReference } from "./enums/situacion-reference.enum";

export interface MatriculaDto {
  identifier: string;
  codigo: string;
  situacion: SituacionReference;
  procedencia: string; 
  fechaMatricula: string;
  estado: EstadoMatriculaReference;
  fechaCreacion: string;
  nivel: string; // Identifier
  grado: string; // Identifier
  estudiante: string; // Identifier
  apoderado: string; // Identifier
  anioAcademico: string; // Identifier
  cronogramas: CronogramaPagoDto[];

    // --- CAMPOS AÑADIDOS ---
  descuentoMatricula?: number;
  descuentoPension?: number;
}