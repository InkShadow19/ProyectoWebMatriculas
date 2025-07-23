import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { MatriculaDto } from "../models/matricula.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class MatriculaDomainService {
    private endpoint = `${environment.apiUrl}/matriculas`;

    constructor(private http: HttpClient) { }

    /*getList(
        page: number, size: number, 
        codigo?: string, situacion?: string, estado?: string
    ): Observable<PageResponse<MatriculaDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (codigo) params = params.set("codigo", codigo);
        if (situacion) params = params.set("situacion", situacion);
        if (estado) params = params.set("estado", estado);

        return this.http.get<PageResponse<MatriculaDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }*/

    getList(
        page: number, size: number,
        descripcion?: string,
        estado?: string,
        anioId?: string,
        nivelId?: string,
        gradoId?: string
    ): Observable<PageResponse<MatriculaDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) params = params.set("descripcion", descripcion);
        if (estado) params = params.set("estado", estado);
        if (anioId) params = params.set("anioId", anioId);
        if (nivelId) params = params.set("nivelId", nivelId);
        if (gradoId) params = params.set("gradoId", gradoId);

        return this.http.get<PageResponse<MatriculaDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<MatriculaDto>): Observable<MatriculaDto> {
        return this.http.post<MatriculaDto>(this.endpoint, body, { headers: buildHeader() });
    }

    // --- MÉTODO ACTUALIZADO ---
    update(identifier: string, body: Partial<MatriculaDto>): Observable<MatriculaDto> {
        return this.http.patch<MatriculaDto>(`${this.endpoint}/${identifier}`, body, { headers: buildHeader() });
    }

    // --- NUEVO MÉTODO AÑADIDO ---
    anular(identifier: string): Observable<void> {
        return this.http.patch<void>(`${this.endpoint}/${identifier}/anular`, null, { headers: buildHeader() });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, { headers: buildHeader() });
    }
}