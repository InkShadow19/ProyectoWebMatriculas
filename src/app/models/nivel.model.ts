import { GradoDto } from "./grado.model";
import { MatriculaDto } from "./matricula.model";

export interface NivelDto {
  identifier: string;
  descripcion: string;
  habilitado: boolean;
  fechaCreacion: string;
  grados: GradoDto[];
  matriculas: MatriculaDto[];
}