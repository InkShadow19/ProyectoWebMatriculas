import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { RolDto } from "../models/rol.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class RolDomainService {

    private endpoint = `${environment.apiUrl}/roles`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number, descripcion?: string, estado?: string): Observable<PageResponse<RolDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }

        return this.http.get<PageResponse<RolDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<RolDto>): Observable<RolDto> {
        return this.http.post<RolDto>(this.endpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<RolDto>): Observable<RolDto> {
        return this.http.patch<RolDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}