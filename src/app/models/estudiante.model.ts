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
  habilitado: boolean;
  fechaCreacion: string;
  matriculas: MatriculaDto[];
}