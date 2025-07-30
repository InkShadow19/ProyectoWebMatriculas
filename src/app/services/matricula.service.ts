import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { MatriculaDomainService } from '../domains/matricula-domain.service';
import { MatriculaDto } from '../models/matricula.model';
import { PageResponse } from '../models/page-response.model';
import { EstadoMatriculaReference } from '../models/enums/estado-matricula-reference.enum';
import { HttpErrorResponse } from '@angular/common/http';
//import { SituacionReference } from '../models/enums/situacion-reference.enum';

@Injectable({
    providedIn: 'root',
})
export class MatriculaService {
    isLoadingSubject = new BehaviorSubject<boolean>(false);

    constructor(private domainService: MatriculaDomainService) { }

    getList(
        page: number,
        size: number,
        descripcion?: string,
        estado?: EstadoMatriculaReference | string,
        anioId?: string,
        nivelId?: string,
        gradoId?: string,
        // --- PARÁMETROS AÑADIDOS ---
        fechaDesde?: string,
        fechaHasta?: string
    ): Observable<PageResponse<MatriculaDto> | undefined> {
        this.isLoadingSubject.next(true);
        // --- Pasamos los nuevos parámetros al domainService ---
        return this.domainService.getList(
            page, size,
            descripcion,
            estado,
            anioId,
            nivelId,
            gradoId,
            fechaDesde,
            fechaHasta
        ).pipe(
            catchError(() => of(undefined)),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    add(body: Partial<MatriculaDto>): Observable<MatriculaDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.add(body).pipe(
            // --- CAMBIO AQUÍ: Capturamos el error completo ---
            catchError((error: HttpErrorResponse) => {
                // Extraemos el mensaje de error del backend
                const errorMessage = error.error?.error || 'No se pudo registrar la matrícula.';
                // Lo mostramos en la consola para depuración
                console.error('Error desde el backend:', errorMessage);
                // Devolvemos el error para que el componente lo maneje
                return throwError(() => new Error(errorMessage));
            }),
            finalize(() => this.isLoadingSubject.next(false))
        );
    }
    
    update(identifier: string, body: Partial<MatriculaDto>): Observable<MatriculaDto | undefined> {
        this.isLoadingSubject.next(true);
        return this.domainService.update(identifier, body).pipe(
             // --- CAMBIO AQUÍ: Capturamos el error completo ---
            catchError((error: HttpErrorResponse) => {
                const errorMessage = error.error?.error || 'No se pudo actualizar la matrícula.';
                console.error('Error desde el backend:', errorMessage);
                return throwError(() => new Error(errorMessage));
            }),
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

    completar(identifier: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.domainService.completar(identifier).pipe(
      map(() => true),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.error || 'No se pudo completar la matrícula.';
        console.error('Error desde el backend:', errorMessage);
        return throwError(() => new Error(errorMessage));
      }),
      finalize(() => this.isLoadingSubject.next(false))
    );
  }
}