import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { GradoDto } from "../models/grado.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class GradoDomainService {

    private endpoint = `${environment.apiUrl}/grados`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number, descripcion?: string, estado?: string, nivelIdentifier?: string): Observable<PageResponse<GradoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }
        if (nivelIdentifier) {
            params = params.set("nivelIdentifier", nivelIdentifier);
        }

        return this.http.get<PageResponse<GradoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<GradoDto>): Observable<GradoDto> {
        return this.http.post<GradoDto>(this.endpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<GradoDto>): Observable<GradoDto> {
        return this.http.patch<GradoDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}