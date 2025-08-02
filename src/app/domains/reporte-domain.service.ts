import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { buildHeader } from "../common/utils/heade.util";
import { AlumnoPorGradoDto } from '../models/alumno-por-grado.model';
import { MorosidadAgrupadaDto } from "../models/morosidad-agrupada.model";
import { PagosPorPeriodoDto } from "../models/pagos-por-periodo.model";
import { EstadoCuentaDto } from "../models/estado-cuenta.model";

@Injectable({
    providedIn: 'root',
})
export class ReporteDomainService {
    private endpoint = `${environment.apiUrl}/report`;

    constructor(private http: HttpClient) { }

    getAlumnosPorGrado(anio: number, nivelId?: string, gradoId?: string): Observable<AlumnoPorGradoDto[]> {
        let params = new HttpParams().set("anio", anio.toString());
        if (nivelId) params = params.set("nivel", nivelId);
        if (gradoId) params = params.set("grado", gradoId);

        return this.http.get<AlumnoPorGradoDto[]>(`${this.endpoint}/alumnos/por/grado`, {
            headers: buildHeader(),
            params: params
        });
    }

    getReporteMorosidad(anio: number, nivelId?: string, gradoId?: string): Observable<MorosidadAgrupadaDto[]> {
        let params = new HttpParams().set("anio", anio.toString());
        if (nivelId) params = params.set("nivel", nivelId);
        if (gradoId) params = params.set("grado", gradoId);
        
        return this.http.get<MorosidadAgrupadaDto[]>(`${this.endpoint}/alumnos/morosos`, {
            headers: buildHeader(),
            params: params
        });
    }

    getPagosPorPeriodo(fechaDesde?: string, fechaHasta?: string): Observable<PagosPorPeriodoDto[]> {
        let params = new HttpParams();
        if (fechaDesde) {
            const startOfDay = new Date(fechaDesde + 'T00:00:00');
            params = params.set("fechaDesde", startOfDay.toISOString());
        }
        if (fechaHasta) {
            const endOfDay = new Date(fechaHasta + 'T23:59:59.999');
            params = params.set("fechaHasta", endOfDay.toISOString());
        }
        
        return this.http.get<PagosPorPeriodoDto[]>(`${this.endpoint}/pagos/por/periodos`, {
            headers: buildHeader(),
            params: params
        });
    }

    getEstadoCuenta(estudianteId: string, anio: number): Observable<EstadoCuentaDto[]> {
        const params = new HttpParams().set('anio', anio.toString());
        return this.http.get<EstadoCuentaDto[]>(`${this.endpoint}/estudiante/${estudianteId}/estado/cuenta`, {
            headers: buildHeader(),
            params: params
        });
    }
}