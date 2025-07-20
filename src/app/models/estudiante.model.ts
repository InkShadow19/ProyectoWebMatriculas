import { EstadoAcademicoReference } from "./enums/estado-academico-reference.enum";
import { GeneroReference } from "./enums/genero-reference.enum";
import { MatriculaDto } from "./matricula.model";

export interface EstudianteDto {
  identifier: string;
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento?: string;
  genero?: GeneroReference;
  direccion?: string;
  telefono?: string;
  email?: string;
  estadoAcademico: EstadoAcademicoReference;
  fechaCreacion: string;
  matriculas: MatriculaDto[];
}