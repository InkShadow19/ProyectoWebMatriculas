import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { MatriculaDomainService } from '../domains/matricula-domain.service';
import { MatriculaDto } from '../models/matricula.model';
import { PageResponse } from '../models/page-response.model';
import { EstadoMatriculaReference } from '../models/enums/estado-matricula-reference.enum';
//import { SituacionReference } from '../models/enums/situacion-reference.enum';

@Injectable({
    providedIn: 'root',
})
export class MatriculaService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private domainService: MatriculaDomainService) { }

    /*getList(
        page: number, size: number, 
        codigo?: string, situacion?: string, estado?: string
    ): Observable<PageResponse<MatriculaDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getList(page, size, codigo, situacion, estado).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }*/

    getList(
        page: number,
        size: number,
        descripcion?: string,
        estado?: EstadoMatriculaReference | string,
        anioId?: string,
        nivelId?: string,
        gradoId?: string
    ): Observable<PageResponse<MatriculaDto> | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.getList(
            page, size,
            descripcion,
            estado,
            anioId,
            nivelId,
            gradoId
        ).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    add(body: Partial<MatriculaDto>): Observable<MatriculaDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.add(body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    update(identifier: string, body: Partial<MatriculaDto>): Observable<MatriculaDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.update(identifier, body).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    anular(identifier: string): Observable<boolean> {
        this.isLoadingSubject.next(true);
        return this.domainService.anular(identifier).pipe(
            map(() => true),
            catchError(() => of(false)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
}