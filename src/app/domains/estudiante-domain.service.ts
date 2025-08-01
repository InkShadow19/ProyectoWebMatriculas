import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { EstudianteDto } from "../models/estudiante.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";
import { EstadoAcademicoReference } from "../models/enums/estado-academico-reference.enum";

@Injectable({
    providedIn: 'root',
})
export class EstudianteDomainService {

    private endpoint = `${environment.apiUrl}/estudiantes`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number, descripcion?: string, estadoA?: EstadoAcademicoReference): Observable<PageResponse<EstudianteDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        // El backend espera 'estadoA' para el filtro de estado académico
        if (estadoA) {
            params = params.set("estadoA", estadoA);
        }

        return this.http.get<PageResponse<EstudianteDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<EstudianteDto>): Observable<EstudianteDto> {
        return this.http.post<EstudianteDto>(
            this.endpoint,
            body,
            { headers: buildHeader() }
        );
    }

    update(identifier: string, body: Partial<EstudianteDto>): Observable<EstudianteDto> {
        return this.http.patch<EstudianteDto>(
            `${this.endpoint}/${identifier}`,
            body,
            { headers: buildHeader() }
        );
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(
            `${this.endpoint}/${identifier}`,
            { headers: buildHeader() }
        );
    }

    get(identifier: string): Observable<EstudianteDto> {
        return this.http.get<EstudianteDto>(`${this.endpoint}/${identifier}`,
            { headers: buildHeader() }
        );
    }
    
    searchActivos(page: number, size: number, descripcion?: string): Observable<PageResponse<EstudianteDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());
        if (descripcion) params = params.set("descripcion", descripcion);

        return this.http.get<PageResponse<EstudianteDto>>(`${this.endpoint}/search/activos`, {
            headers: buildHeader(),
            params: params
        });
    }
}