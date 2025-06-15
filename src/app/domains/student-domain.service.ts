import { Injectable } from "@angular/core";
import { TStudentModel } from "../models/t.student";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ApiResponse } from "../common/models/api-response.model";
import { buildHeader } from "../common/utils/heade.util";

@Injectable({
  providedIn: 'root',
})
export class StudentDomainService {

  constructor(private http: HttpClient) { }

  add(body: TStudentModel): Observable<ApiResponse<TStudentModel>> {
    return this.http.post<ApiResponse<TStudentModel>>(`${environment.apiUrl}/test/student`, body, {
      headers: buildHeader()
    });
  }

  update(identifier: string, body: TStudentModel): Observable<ApiResponse<TStudentModel>> {
    return this.http.patch<ApiResponse<TStudentModel>>(`${environment.apiUrl}/test/student/${identifier}`, body, {
      headers: buildHeader()
    });
  }

  get(identifier: string): Observable<ApiResponse<TStudentModel>> {
    return this.http.get<ApiResponse<TStudentModel>>(`${environment.apiUrl}/test/student/${identifier}`, {
      headers: buildHeader()
    });
  }

  getList(page: number, size: number, description?: string, enabled?: string, filters?: Record<string, string>): Observable<ApiResponse<TStudentModel>> {

    var params = new HttpParams()
    params = params.set("page", page.toString())
    params = params.set("size", size.toString())
    if (description) params = params.set("description", description.toString())
    if (enabled) params = params.set("enabled", enabled.toString())
    if (filters && Object.keys(filters).length > 0) { for (let key in filters) params = params.set(key, filters[key]) }

    return this.http.get<ApiResponse<TStudentModel>>(`${environment.apiUrl}/test/student/search`, {
      headers: buildHeader(),
      params: params
    });
  }
}