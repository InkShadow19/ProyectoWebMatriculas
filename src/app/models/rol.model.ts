import { EstadoReference } from "./enums/estado-reference.enum";
import { UsuarioDto } from "./usuario.model";

export interface RolDto {
  identifier: string;
  descripcion: string;
  estado: EstadoReference;
  fechaCreacion: string;
  usuarios: UsuarioDto[];
}