import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { UsuarioDto } from "../models/usuario.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class UsuarioDomainService {

    // NOTA: El backend no tiene un endpoint de búsqueda para usuarios,
    // pero lo prepararemos para cuando lo tenga. Usaremos un endpoint
    // ficticio '/search' por ahora.
    private endpoint = `${environment.apiUrl}/usuarios`;
    private registerEndpoint = `${environment.apiUrl}/auth/registrar`; // Endpoint para registrar

    constructor(private http: HttpClient) { }

    // Este método asumirá que el backend tendrá un endpoint de búsqueda en el futuro.
    getList(page: number, size: number, descripcion?: string, estado?: string): Observable<PageResponse<UsuarioDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }

        // TODO: Asegúrate de que tu backend tenga este endpoint o ajústalo al que corresponda.
        return this.http.get<PageResponse<UsuarioDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    // Usamos un endpoint específico para registrar/añadir usuarios
    add(body: Partial<UsuarioDto>): Observable<UsuarioDto> {
        return this.http.post<UsuarioDto>(this.registerEndpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<UsuarioDto>): Observable<UsuarioDto> {
        return this.http.patch<UsuarioDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }
    
    resetPassword(identifier: string, newPassword: string): Observable<void> {
        const body = { newPassword: newPassword };
        return this.http.post<void>(`${this.endpoint}/${identifier}/reset-password`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}