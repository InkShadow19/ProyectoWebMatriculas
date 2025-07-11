import { EstadoAcademicoReference } from "./enums/estado-academico-reference.enum";
import { MatriculaDto } from "./matricula.model";

export interface AnioAcademicoDto {
  identifier: string;
  anio: number;
  estado: EstadoAcademicoReference;
  fechaCreacion: string;
  matriculas: MatriculaDto[];
}
