import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ApoderadoDomainService } from '../domains/apoderado-domain.service';
import { ApoderadoDto } from '../models/apoderado.model';

import { PageResponse } from '../models/page-response.model';
import { HttpErrorResponse } from '@angular/common/http';
import { EstadoReference } from '../models/enums/estado-reference.enum';

@Injectable({
    providedIn: 'root',
})
export class ApoderadoService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private apoderadoDomainService: ApoderadoDomainService
    ) { }

    // --- FIRMA DEL MÉTODO CORREGIDA ---
    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: EstadoReference): Observable<PageResponse<ApoderadoDto> | undefined> {
        this.isLoadingSubject.next(true);
        // --- LLAMADA CORREGIDA (sin 'genero') ---
        return this.apoderadoDomainService.getList(page, size, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    get(identifier: string): Observable<ApoderadoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.apoderadoDomainService.get(identifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<ApoderadoDto>): Observable<ApoderadoDto> {
        this.isLoadingSubject.next(true);
        return this.apoderadoDomainService.add(body).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => error)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<ApoderadoDto>): Observable<ApoderadoDto> {
        this.isLoadingSubject.next(true);
        return this.apoderadoDomainService.update(identifier, body).pipe(
            catchError((error: HttpErrorResponse) => throwError(() => error)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.apoderadoDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
