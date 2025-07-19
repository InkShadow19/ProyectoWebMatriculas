import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AnioAcademicoDomainService } from '../domains/anio-academico-domain.service';
import { AnioAcademicoDto } from "../models/anio-academico.model";
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class AnioAcademicoService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private anioAcademicoDomainService: AnioAcademicoDomainService,
    ) { }

    getList(page: number = 0, size: number = 10, anio?: number, estadoA?: string): Observable<PageResponse<AnioAcademicoDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.anioAcademicoDomainService.getList(page, size, anio, estadoA).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    get(identifier: string): Observable<AnioAcademicoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.anioAcademicoDomainService.get(identifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<AnioAcademicoDto>): Observable<AnioAcademicoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.anioAcademicoDomainService.add(body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<AnioAcademicoDto>): Observable<AnioAcademicoDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.anioAcademicoDomainService.update(identifier, body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.anioAcademicoDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}