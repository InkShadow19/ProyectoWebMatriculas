import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { DashboardDomainService } from '../domains/dashboard-domain.service';
import { DashboardData } from '../models/dashboard-data.model';
import { AnalisisAnual } from '../models/analisis-anual.model';

@Injectable({
    providedIn: 'root',
})
export class DashboardService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private domainService: DashboardDomainService) { }

    // --- MÉTODO ACTUALIZADO ---
    getKpiFijosData(): Observable<DashboardData | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getKpiFijosData().pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    // --- NUEVO MÉTODO AÑADIDO ---
    getAnalisisAnualData(anioId: string, nivelId?: string): Observable<AnalisisAnual | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getAnalisisAnualData(anioId, nivelId).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
}