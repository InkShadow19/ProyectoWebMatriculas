import { EstadoReference } from "./enums/estado-reference.enum";
import { GeneroReference } from "./enums/genero-reference.enum";
import { PagoDto } from "./pago.model";

export interface UsuarioDto {
  identifier: string;
  usuario: string;
  contrasena?: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  genero?: GeneroReference;
  dni: string;
  estado: EstadoReference; 
  fechaCreacion: string;
  rol: string; // Identifier del Rol
  pagos: PagoDto[];
}