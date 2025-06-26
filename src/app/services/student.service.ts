import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { StudentDomainService } from '../domains/student-domain.service';
import { HttpClient } from '@angular/common/http';
import { TStudentModel } from '../models/t.student';
import { NotificationService } from '../common/service/notification.service';

@Injectable({
  providedIn: 'root',
})
export class StudentService implements OnDestroy {

  isLoadingSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  params: Record<string, string> = {}

  // private fields
  private unsubscribe: Subscription[] = [];
  public totalPages: number = 0

  constructor(
    http: HttpClient,
    private studentDomainService: StudentDomainService,
    private notification: NotificationService
  ) { }

  add(body: TStudentModel): Observable<TStudentModel | undefined> {
    return this.studentDomainService.add(body).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          this.notification.showError(`Error ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`No se puede obtener el socio de negocio. Error ${error.message}`, 'Error');
        return of()
      }),
      finalize(() => { })
    );
  }

  update(identifier: string, body: TStudentModel): Observable<TStudentModel | undefined> {
    return this.studentDomainService.update(identifier, body).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          this.notification.showError(`Error ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`No se puede obtener el socio de negocio. Error ${error.message}`, 'Error');
        return of()
      }),
      finalize(() => { })
    );
  }

  getListSearch(page: number = 0, size: number = 10, description?: string, enabled?: boolean, filters?: Record<string, string>): Observable<TStudentModel | undefined> {
    return this.studentDomainService.getList(page, size, description, enabled, filters).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          this.notification.showError(`Error ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`No se puede obtener el socio de negocio. Error ${error}`, 'Error');
        return of()
      }),
      finalize(() => { })
    );
  }

  get(identifier: string): Observable<TStudentModel | undefined> {
    this.isLoadingSubject.next(true)
    return this.studentDomainService.get(identifier).pipe(
      map(response => {
        if (response.success) {
          return response.data;
        } else {
          this.notification.showError(`Error ${response.message}`, 'Error');
          return undefined;
        }
      }),
      catchError((error) => {
        this.notification.showError(`No se puede obtener el socio de negocio. Error ${error}`, 'Error');
        return of()
      }),
      finalize(() => { this.isLoadingSubject.next(false) })
    );
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }

}
