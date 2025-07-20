import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { GradoDomainService } from '../domains/grado-domain.service';
import { GradoDto } from '../models/grado.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class GradoService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private gradoDomainService: GradoDomainService,
    ) { }

    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: string, nivelIdentifier?: string): Observable<PageResponse<GradoDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.gradoDomainService.getList(page, size, descripcion, estado, nivelIdentifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<GradoDto>): Observable<GradoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.gradoDomainService.add(body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<GradoDto>): Observable<GradoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.gradoDomainService.update(identifier, body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.gradoDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}