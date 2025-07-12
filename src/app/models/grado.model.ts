import { EstadoReference } from "./enums/estado-reference.enum";
import { MatriculaDto } from "./matricula.model";

export interface GradoDto {
  identifier: string;
  descripcion: string;
  estado: EstadoReference;
  fechaCreacion: string;
  nivel: string; // Identifier del Nivel
  matriculas: MatriculaDto[];
}