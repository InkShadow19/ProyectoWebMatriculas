import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { UsuarioDomainService } from '../domains/usuario-domain.service';
import { UsuarioDto } from '../models/usuario.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
    providedIn: 'root',
})
export class UsuarioService implements OnDestroy {

    isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    private unsubscribe: Subscription[] = [];

    constructor(
        private usuarioDomainService: UsuarioDomainService,
    ) { }

    getList(page: number = 0, size: number = 10, descripcion?: string, estado?: string): Observable<PageResponse<UsuarioDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.usuarioDomainService.getList(page, size, descripcion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    add(body: Partial<UsuarioDto>): Observable<UsuarioDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.usuarioDomainService.add(body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    update(identifier: string, body: Partial<UsuarioDto>): Observable<UsuarioDto> {
    this.isLoadingSubject.next(true);
    // Asumiendo que tienes un 'usuarioDomainService' como en tu RolService
    return this.usuarioDomainService.update(identifier, body).pipe(
        // ESTA LÍNEA ES LA CLAVE:
        // Captura el error del backend y lo relanza para que el componente lo reciba.
        catchError(err => throwError(() => err)),
        finalize(() => this.isLoadingSubject.next(false))
    );
}

    resetPassword(identifier: string, newPassword: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.usuarioDomainService.resetPassword(identifier, newPassword).pipe(
            map(() => true), // Si tiene éxito, devuelve true
            catchError(() => of(false)), // En caso de error, devuelve false
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    delete(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.usuarioDomainService.delete(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }

    ngOnDestroy(): void {
        this.unsubscribe.forEach(sub => sub.unsubscribe());
    }
}