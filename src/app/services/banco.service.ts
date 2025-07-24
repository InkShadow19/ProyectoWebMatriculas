import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { BancoDomainService } from '../domains/banco-domain.service';
import { BancoDto } from '../models/banco.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class BancoService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private bancoDomainService: BancoDomainService,
    ) { }

    getList(page: number = 0, size: number = 10, codigo?: string, descripcion?: string, estado?: string): Observable<PageResponse<BancoDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.bancoDomainService.getList(page, size, codigo, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<BancoDto>): Observable<BancoDto> {
        this.isLoadingSubject.next(true);
        return this.bancoDomainService.add(body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<BancoDto>): Observable<BancoDto> {
        this.isLoadingSubject.next(true);
        return this.bancoDomainService.update(identifier, body).pipe(
            catchError(err => throwError(() => err)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.bancoDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}