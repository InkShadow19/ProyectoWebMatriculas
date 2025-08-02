import { EstadoReference } from "./enums/estado-reference.enum";
import { GeneroReference } from "./enums/genero-reference.enum";

export interface UserProfile {
  identifier: string;
  usuario: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  // CAMBIO: Ahora esperamos los enums como strings, igual que en UsuarioDto
  genero: GeneroReference;
  dni: string;
  estado: EstadoReference; 
  rol: string;
  totalPagosRegistrados: number;
}