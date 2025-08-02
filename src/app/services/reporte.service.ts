import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ReporteDomainService } from '../domains/reporte-domain.service';
import { AlumnoPorGradoDto } from '../models/alumno-por-grado.model';
import { MorosidadAgrupadaDto } from '../models/morosidad-agrupada.model';
import { PagosPorPeriodoDto } from '../models/pagos-por-periodo.model';
import { EstadoCuentaDto } from '../models/estado-cuenta.model';

@Injectable({
    providedIn: 'root',
})
export class ReporteService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private domainService: ReporteDomainService) { }

    getAlumnosPorGrado(anio: number, nivelId?: string, gradoId?: string): Observable<AlumnoPorGradoDto[] | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getAlumnosPorGrado(anio, nivelId, gradoId).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    getReporteMorosidad(anio: number, nivelId?: string, gradoId?: string): Observable<MorosidadAgrupadaDto[] | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getReporteMorosidad(anio, nivelId, gradoId).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    getPagosPorPeriodo(fechaDesde?: string, fechaHasta?: string): Observable<PagosPorPeriodoDto[] | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getPagosPorPeriodo(fechaDesde, fechaHasta).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    getEstadoCuenta(estudianteId: string, anio: number): Observable<EstadoCuentaDto[] | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getEstadoCuenta(estudianteId, anio).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
}