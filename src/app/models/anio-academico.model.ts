import { EstadoAcademicoReference } from "./enums/estado-academico-reference.enum";
import { MatriculaDto } from "./matricula.model";

export interface AnioAcademicoDto {
  identifier: string;
  anio: number;
  estadoAcademico: EstadoAcademicoReference;
  fechaCreacion: string;
  matriculas: MatriculaDto[];
}
