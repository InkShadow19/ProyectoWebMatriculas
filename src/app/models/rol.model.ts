import { UsuarioDto } from "./usuario.model";

export interface RolDto {
  identifier: string;
  descripcion: string;
  habilitado: boolean;
  fechaCreacion: string;
  usuarios: UsuarioDto[];
}