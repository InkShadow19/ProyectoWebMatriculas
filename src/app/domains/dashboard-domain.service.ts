import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { buildHeader } from "../common/utils/heade.util";
import { DashboardData } from "../models/dashboard-data.model";
import { AnalisisAnual } from "../models/analisis-anual.model";

@Injectable({
    providedIn: 'root',
})
export class DashboardDomainService {
    private endpoint = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    // --- MÉTODO ACTUALIZADO ---
    getKpiFijosData(): Observable<DashboardData> {
        return this.http.get<DashboardData>(`${this.endpoint}/kpis-fijos`, { headers: buildHeader() });
    }

    // --- NUEVO MÉTODO AÑADIDO ---
    getAnalisisAnualData(anioId: string, nivelId?: string): Observable<AnalisisAnual> {
        let params = new HttpParams().set('anioId', anioId);
        if (nivelId) {
            params = params.set('nivelId', nivelId);
        }
        return this.http.get<AnalisisAnual>(`${this.endpoint}/analisis-anual`, {
            headers: buildHeader(),
            params: params
        });
    }
}