import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApoderadoDto } from "../models/apoderado.model";
import { ApiResponse } from "../common/models/api-response.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class ApoderadoDomainService {

    // Endpoint específico para el módulo de Apoderados
    private endpoint = `${environment.apiUrl}/apoderados`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number): Observable<PageResponse<ApoderadoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        return this.http.get<PageResponse<ApoderadoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<ApoderadoDto>): Observable<ApoderadoDto> {
        return this.http.post<ApoderadoDto>(
            this.endpoint,
            body,
            { headers: buildHeader() }
        );
    }

    update(identifier: string, body: Partial<ApoderadoDto>): Observable<ApoderadoDto> {
        return this.http.patch<ApoderadoDto>(
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

    get(identifier: string): Observable<ApoderadoDto> {
        return this.http.get<ApoderadoDto>(`${this.endpoint}/${identifier}`);
    }

    /*getList(page: number, size: number, description?: string, enabled?: boolean, filters?: Record<string, string>): Observable<ApiResponse<ApoderadoDto[]>> {

        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (description) {
            params = params.set("description", description);
        }
        if (enabled !== undefined) {
            params = params.set("enabled", enabled.toString());
        }
        if (filters) {
            for (const key in filters) {
                if (filters.hasOwnProperty(key)) {
                    params = params.set(key, filters[key]);
                }
            }
        }

        return this.http.get<ApiResponse<ApoderadoDto[]>>(this.endpoint, {
            headers: buildHeader(),
            params: params
        });

    }*/
}
