import { EstadoReference } from "./enums/estado-reference.enum";
import { GradoDto } from "./grado.model";
import { MatriculaDto } from "./matricula.model";

export interface NivelDto {
  identifier: string;
  descripcion: string;
  estado: EstadoReference;
  fechaCreacion: string;
  grados: GradoDto[];
  matriculas: MatriculaDto[];
}