import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription,throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { RolDomainService } from '../domains/rol-domain.service';
import { RolDto } from '../models/rol.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class RolService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private rolDomainService: RolDomainService,
    ) { }

    // MODIFICADO: Ahora el método getList puede recibir y usar los filtros de descripción y estado.
    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: string): Observable<PageResponse<RolDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.rolDomainService.getList(page, size, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<RolDto>): Observable<RolDto> {
        this.isLoadingSubject.next(true);
        return this.rolDomainService.add(body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<RolDto>): Observable<RolDto> {
        this.isLoadingSubject.next(true);
        return this.rolDomainService.update(identifier, body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.rolDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(err => throwError(() => err))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}