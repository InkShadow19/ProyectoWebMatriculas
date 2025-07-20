import { CronogramaPagoDto } from "./cronograma-pago.model";
import { EstadoMatriculaReference } from "./enums/estado-matricula-reference.enum";
import { SituacionReference } from "./enums/situacion-reference.enum";

export interface MatriculaDto {
  identifier: string;
  codigo: number; // En la BD es codigo_matricula, el DTO lo llama codigo
  situacion: SituacionReference;
  institucion_procendencia: string;
  fechaMatricula: string;
  estado: EstadoMatriculaReference;
  fechaCreacion: string;
  nivel: string; // Identifier
  grado: string; // Identifier
  estudiante: string; // Identifier
  apoderado: string; // Identifier
  anioAcademico: string; // Identifier
  cronogramas: CronogramaPagoDto[];
}