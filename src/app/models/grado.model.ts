import { MatriculaDto } from "./matricula.model";

export interface GradoDto {
  identifier: string;
  descripcion: string;
  habilitado: boolean;
  fechaCreacion: string;
  nivel: string; // Identifier del Nivel
  matriculas: MatriculaDto[];
}