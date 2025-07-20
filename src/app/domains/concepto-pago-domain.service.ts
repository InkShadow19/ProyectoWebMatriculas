import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ConceptoPagoDto } from "../models/concepto-pago.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";
import { EstadoReference } from "../models/enums/estado-reference.enum";

@Injectable({
    providedIn: 'root',
})
export class ConceptoPagoDomainService {

    private endpoint = `${environment.apiUrl}/conceptos/pago`;

    constructor(private http: HttpClient) { }

    getList(page: number, size: number, descripcion?: string, estado?: EstadoReference): Observable<PageResponse<ConceptoPagoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (descripcion) {
            params = params.set("descripcion", descripcion);
        }
        if (estado) {
            params = params.set("estado", estado);
        }

        return this.http.get<PageResponse<ConceptoPagoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    add(body: Partial<ConceptoPagoDto>): Observable<ConceptoPagoDto> {
        return this.http.post<ConceptoPagoDto>(
            this.endpoint,
            body,
            { headers: buildHeader() }
        );
    }

    update(identifier: string, body: Partial<ConceptoPagoDto>): Observable<ConceptoPagoDto> {
        return this.http.patch<ConceptoPagoDto>(
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

    get(identifier: string): Observable<ConceptoPagoDto> {
        return this.http.get<ConceptoPagoDto>(`${this.endpoint}/${identifier}`,
            { headers: buildHeader() }
        );
    }
}