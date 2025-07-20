import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ConceptoPagoDomainService } from '../domains/concepto-pago-domain.service';
import { ConceptoPagoDto } from '../models/concepto-pago.model';
import { PageResponse } from '../models/page-response.model';
import { EstadoReference } from '../models/enums/estado-reference.enum';

@Injectable({
    providedIn: 'root',
})
export class ConceptoPagoService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private conceptoPagoDomainService: ConceptoPagoDomainService
    ) { }

    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: EstadoReference): Observable<PageResponse<ConceptoPagoDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.conceptoPagoDomainService.getList(page, size, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    get(identifier: string): Observable<ConceptoPagoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.conceptoPagoDomainService.get(identifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<ConceptoPagoDto>): Observable<ConceptoPagoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.conceptoPagoDomainService.add(body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<ConceptoPagoDto>): Observable<ConceptoPagoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.conceptoPagoDomainService.update(identifier, body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.conceptoPagoDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}