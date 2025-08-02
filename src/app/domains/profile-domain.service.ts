import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { UserProfile } from "../models/user-profile.model";
import { environment } from "src/environments/environment";
import { buildHeader } from "../common/utils/heade.util";

@Injectable({
  providedIn: 'root',
})
export class ProfileDomainService {
  // Definimos el endpoint específico para el perfil del usuario
  private endpoint = `${environment.apiUrl}/usuarios/me`;

  constructor(private http: HttpClient) {}

  /**
   * Realiza la petición GET al endpoint /usuarios/me para obtener los datos del perfil.
   * Utiliza la función buildHeader() para añadir el token de autorización.
   * @returns Un Observable con los datos del perfil del usuario.
   */
  getMyProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.endpoint, {
      headers: buildHeader(), // Usamos tu utilidad para las cabeceras
    });
  }
}