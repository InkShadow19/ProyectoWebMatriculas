import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { EstudianteDomainService } from '../domains/estudiante-domain.service';
import { EstudianteDto } from '../models/estudiante.model';
import { PageResponse } from '../models/page-response.model';
import { EstadoAcademicoReference } from '../models/enums/estado-academico-reference.enum';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class EstudianteService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private estudianteDomainService: EstudianteDomainService
    ) { }

    getList(page: number = 0, size: number = 10, descripcion?: string, estadoA?: EstadoAcademicoReference): Observable<PageResponse<EstudianteDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.getList(page, size, descripcion, estadoA).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    get(identifier: string): Observable<EstudianteDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.get(identifier).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // --- MÉTODO ADD CORREGIDO ---
    add(body: Partial<EstudianteDto>): Observable<EstudianteDto> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.add(body).pipe(
            catchError((error: HttpErrorResponse) => {
                // Dejamos que el error fluya hacia el componente
                return throwError(() => error);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    // --- MÉTODO UPDATE CORREGIDO ---
    update(identifier: string, body: Partial<EstudianteDto>): Observable<EstudianteDto> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.update(identifier, body).pipe(
            catchError((error: HttpErrorResponse) => {
                // Dejamos que el error fluya hacia el componente
                return throwError(() => error);
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.delete(identifier).pipe(
            map(() => true),
            catchError((error: HttpErrorResponse) => {
                // 1. Extrae el mensaje de error específico del backend.
                const errorMessage = error.error?.error || 'No se pudo eliminar el alumno.';
                // 2. Lanza un nuevo error con ese mensaje para que el componente lo reciba.
                return throwError(() => new Error(errorMessage));
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    getSearchActivos(page: number, size: number, descripcion?: string): Observable<PageResponse<EstudianteDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.estudianteDomainService.searchActivos(page, size, descripcion).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy() {
        this.unsubscribe.forEach((sb) => sb.unsubscribe());
    }
}
