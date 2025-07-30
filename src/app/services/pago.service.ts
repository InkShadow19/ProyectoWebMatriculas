import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { PagoDomainService } from '../domains/pago-domain.service';
import { PagoDto } from '../models/pago.model';
import { PageResponse } from '../models/page-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { CronogramaPagoDto } from '../models/cronograma-pago.model';

@Injectable({
    providedIn: 'root',
})
export class PagoService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private domainService: PagoDomainService) { }

    getList(
        page: number, size: number, estado?: string, canal?: string, 
        descripcion?: string,
        monto?: number, fechaDesde?: string, fechaHasta?: string
    ): Observable<PageResponse<PagoDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getList(page, size, estado, canal, descripcion, monto, fechaDesde, fechaHasta).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    getDeudasPendientes(estudianteIdentifier: string): Observable<CronogramaPagoDto[] | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getDeudasPendientes(estudianteIdentifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // --- NUEVO MÉTODO AÑADIDO ---
    getNextCajaTicket(): Observable<string | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getNextCajaTicket().pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<PagoDto>): Observable<PagoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.add(body).pipe(
            catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.error || 'No se pudo registrar el pago.';
                return throwError(() => new Error(errorMessage));
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    anular(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.domainService.anular(identifier).pipe(
            map(() => true),
            catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.error || 'No se pudo anular el pago.';
                return throwError(() => new Error(errorMessage));
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
}