import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { AnioAcademicoDto } from "../models/anio-academico.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class AnioAcademicoDomainService {

    private endpoint = `${environment.apiUrl}/anios/academicos`;

    constructor(private http: HttpClient) { }
    
    getList(page: number, size: number, anio?: number, estadoA?: string): Observable<PageResponse<AnioAcademicoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        // Añade los parámetros de filtro solo si tienen un valor
        if (anio) {
            params = params.set("anio", anio);
        }
        if (estadoA) {
            params = params.set("estadoA", estadoA);
        }

        return this.http.get<PageResponse<AnioAcademicoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<AnioAcademicoDto>): Observable<AnioAcademicoDto> {
        return this.http.post<AnioAcademicoDto>(this.endpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<AnioAcademicoDto>): Observable<AnioAcademicoDto> {
        return this.http.patch<AnioAcademicoDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }

    get(identifier: string): Observable<AnioAcademicoDto> {
        return this.http.get<AnioAcademicoDto>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}