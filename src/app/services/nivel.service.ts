import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription,throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { NivelDomainService } from '../domains/nivel-domain.service';
import { NivelDto } from '../models/nivel.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class NivelService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private nivelDomainService: NivelDomainService,
    ) { }

    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: string): Observable<PageResponse<NivelDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.nivelDomainService.getList(page, size, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<NivelDto>): Observable<NivelDto> {
        this.isLoadingSubject.next(true);
        return this.nivelDomainService.add(body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<NivelDto>): Observable<NivelDto> {
        this.isLoadingSubject.next(true);
        return this.nivelDomainService.update(identifier, body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.nivelDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(err => throwError(() => err))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}