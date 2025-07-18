import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { ApoderadoDomainService } from '../domains/apoderado-domain.service';
import { ApoderadoDto } from '../models/apoderado.model';
import { NotificationService } from '../common/service/notification.service';
import { ApiResponse } from '../common/models/api-response.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApoderadoService implements OnDestroy {

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private unsubscribe: Subscription[] = [];

  constructor(
    private apoderadoDomainService: ApoderadoDomainService,
    private notification: NotificationService,
  ) { }

  /* Obtiene la lista paginada de apoderados */
  getList(page: number = 0, size: number = 10): Observable<PageResponse<ApoderadoDto> | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.getList(page, size).pipe(
      map(response => {
        return response;
      }),
      catchError((error) => {
        this.notification.showError(`Error al obtener la lista de apoderados. Error: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }

  /* Agrega un nuevo apoderado */
  add(body: Partial<ApoderadoDto>): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.add(body).pipe(
      map(response => {
        this.notification.showSuccess('Apoderado creado exitosamente.', 'Éxito');
        return response;
      }),
      catchError((error) => {
        this.notification.showError(`Error de conexión: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }

  /*add(body: Partial<ApoderadoDto>): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.add(body).pipe(
      map(response => {
        if (response.success) {
          this.notification.showSuccess('Apoderado creado exitosamente.', 'Exito');
          return response.data;
        } else {
          this.notification.showError(`Error: ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`Error de conexión: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }*/

  /*update(identifier: string, body: Partial<ApoderadoDto>): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.update(identifier, body).pipe(
      map(response => {
        if (response.success) {
          this.notification.showSuccess('Apoderado actualizado exitosamente.', 'Exito');
          return response.data;
        } else {
          this.notification.showError(`Error: ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`Error de conexión: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }*/

  /* Actualiza un apoderado existente */
  update(identifier: string, body: Partial<ApoderadoDto>): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.update(identifier, body).pipe(
      map(response => {
        this.notification.showSuccess('Apoderado actualizado exitosamente.', 'Éxito');
        return response;
      }),
      catchError((error) => {
        this.notification.showError(`Error al actualizar: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }

  /* Elimina un apoderado de forma fisica */
  delete(identifier: string): Observable<boolean> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.delete(identifier).pipe(
      map(() => {
        this.notification.showSuccess('Apoderado eliminado exitosamente.', 'Éxito');
        return true;
      }),
      catchError((error) => {
        this.notification.showError(`Error al eliminar: ${error.message}`, 'Error');
        return of(false);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }

  /* Obtener apoderado por Id */
  get(identifier: string): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.get(identifier).pipe(
      map(response => {
        return response;
      }),
      catchError((error) => {
        this.notification.showError(`No se pudo obtener el apoderado. Error: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }

  /*get(identifier: string): Observable<ApoderadoDto | undefined> {
    this.isLoadingSubject.next(true);
    return this.apoderadoDomainService.get(identifier).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          this.notification.showError(`Error: ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`No se pudo obtener el apoderado. Error: ${error.message}`, 'Error');
        return of(undefined);
      }),
      finalize(() => { this.isLoadingSubject.next(false); })
    );
  }*/

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
