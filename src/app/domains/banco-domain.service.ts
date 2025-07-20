import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { BancoDto } from "../models/banco.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";

@Injectable({
    providedIn: 'root',
})
export class BancoDomainService {

    private endpoint = `${environment.apiUrl}/bancos`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number, codigo?: string, descripcion?: string, estado?: string): Observable<PageResponse<BancoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        // El backend espera 'codigo' y 'descripcion' para la búsqueda
        if (codigo) {
            params = params.set("codigo", codigo);
        }
        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }

        return this.http.get<PageResponse<BancoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<BancoDto>): Observable<BancoDto> {
        return this.http.post<BancoDto>(this.endpoint, body, {
            headers: buildHeader()
        });
    }

    update(identifier: string, body: Partial<BancoDto>): Observable<BancoDto> {
        return this.http.patch<BancoDto>(`${this.endpoint}/${identifier}`, body, {
            headers: buildHeader()
        });
    }

    delete(identifier: string): Observable<void> {
        return this.http.delete<void>(`${this.endpoint}/${identifier}`, {
            headers: buildHeader()
        });
    }
}