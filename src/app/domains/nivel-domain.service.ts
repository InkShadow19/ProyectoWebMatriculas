import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { NivelDto } from "../models/nivel.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class NivelDomainService {

    private endpoint = `${environment.apiUrl}/niveles`;

    constructor(private http: HttpClient) { }
    
    getList(page: number, size: number, descripcion?: string, estado?: string): Observable<PageResponse<NivelDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }

        return this.http.get<PageResponse<NivelDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<NivelDto>): Observable<NivelDto> {
        return this.http.post<NivelDto>(this.endpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<NivelDto>): Observable<NivelDto> {
        return this.http.patch<NivelDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }

    get(identifier: string): Observable<NivelDto> {
        return this.http.get<NivelDto>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}