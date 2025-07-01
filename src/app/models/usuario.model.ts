import { GeneroReference } from "./enums/genero-reference.enum";
import { PagoDto } from "./pago.model";

export interface UsuarioDto {
  identifier: string;
  usuario: string;
  contraseña?: string; // La contraseña no debería viajar del back al front
  nombres: string;
  apellidos: string;
  fechaNacimiento?: string;
  genero?: GeneroReference;
  dni: string;
  habilitado: boolean;
  fechaCreacion: string;
  rol: string; // Identifier del Rol
  pagos: PagoDto[];
}