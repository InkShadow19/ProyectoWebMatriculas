import { EstadoReference } from "./enums/estado-reference.enum";
import { GeneroReference } from "./enums/genero-reference.enum";
import { MatriculaDto } from "./matricula.model";

export interface ApoderadoDto {
  identifier: string;
  dni: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  fechaNacimiento?: string;
  genero?: GeneroReference;
  parentesco?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  estado: EstadoReference;
  fechaCreacion: string;
  matriculas: MatriculaDto[];
}