import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { PagoDto } from "../models/pago.model";
import { buildHeader } from "../common/utils/heade.util";
import { PageResponse } from "../models/page-response.model";
import { CronogramaPagoDto } from "../models/cronograma-pago.model";

@Injectable({
    providedIn: 'root',
})
export class PagoDomainService {
    private endpoint = `${environment.apiUrl}/pagos`;
    private reportEndpoint = `${environment.apiUrl}/report`;

    constructor(private http: HttpClient) { }

    getList(
        page: number, size: number, estado?: string, canal?: string, 
        descripcion?: string,
        monto?: number, fechaDesde?: string, fechaHasta?: string
    ): Observable<PageResponse<PagoDto>> {
        let params = new HttpParams()
            .set("page", page.toString())
            .set("size", size.toString());

        if (estado) params = params.set("estado", estado);
        if (canal) params = params.set("canal", canal);
        if (descripcion) params = params.set("descripcion", descripcion);
        if (monto) params = params.set("monto", monto.toString());
        
        // --- LÓGICA DE FILTRO CORREGIDA Y MÁS PRECISA ---
        if (fechaDesde) {
            // Se construye la fecha explícitamente a las 00:00:00 hora local
            const startOfDay = new Date(fechaDesde + 'T00:00:00');
            params = params.set("fechaDesde", startOfDay.toISOString());
        }
        if (fechaHasta) {
            // Se construye la fecha explícitamente a las 23:59:59 hora local
            const endOfDay = new Date(fechaHasta + 'T23:59:59.999');
            params = params.set("fechaHasta", endOfDay.toISOString());
        }
        
        return this.http.get<PageResponse<PagoDto>>(`${this.endpoint}/search`, {
            headers: buildHeader(),
            params: params
        });
    }

    // --- NUEVO MÉTODO AÑADIDO ---
    getNextCajaTicket(): Observable<string> {
        return this.http.get(`${this.endpoint}/next-caja-ticket`, { 
            headers: buildHeader(), 
            responseType: 'text' // Importante: esperamos texto plano, no JSON
        });
    }
    
    // Nuevo método para obtener las deudas de un estudiante
    getDeudasPendientes(estudianteIdentifier: string): Observable<CronogramaPagoDto[]> {
      return this.http.get<CronogramaPagoDto[]>(`${this.reportEndpoint}/estudiante/${estudianteIdentifier}/estado/cuenta`, {
        headers: buildHeader()
      });
    }

    add(body: Partial<PagoDto>): Observable<PagoDto> {
        return this.http.post<PagoDto>(this.endpoint, body, { headers: buildHeader() });
    }

    anular(identifier: string): Observable<void> {
        return this.http.patch<void>(`${this.endpoint}/${identifier}/anular`, null, { headers: buildHeader() });
    }
}