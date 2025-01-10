import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from "../../../environments/environment";
import {AuthService} from "../../modules/auth";

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IPermissionModel {
  _id: string;
  name: string;
  code: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  // private apiUrl = 'https://preview.keenthemes.com/starterkit/metronic/laravel/api/v1/permissions';
  private apiUrl = environment.apiUrl + '/permissions';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });}

  getPermissions(dataTablesParams: any): Observable<any> {
    let params = new HttpParams()
      .set('draw', dataTablesParams.draw)
      .set('start', dataTablesParams.start)
      .set('length', dataTablesParams.length);

    // Agrega cualquier parámetro adicional que necesites
    if (dataTablesParams.search && dataTablesParams.search.value) {
      params = params.set('search[value]', dataTablesParams.search.value);
    }
    return this.http.get<any>(`${this.apiUrl}/data-table`, {params, headers: this.headers});
  }

  getPermissionsAll(): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}/all`;
    return this.http.post<DataTablesResponse>(url, {}, {headers: this.headers});
  }

  getPermission(id: string): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IPermissionModel>(url, {headers: this.headers});
  }

  createPermission(user: IPermissionModel): Observable<IPermissionModel> {
    return this.http.post<IPermissionModel>(`${this.apiUrl}/create`, user, {headers: this.headers});
  }

  updatePermission(id: string, user: IPermissionModel): Observable<IPermissionModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<IPermissionModel>(url, user, {headers: this.headers});
  }

  deletePermission(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, {headers: this.headers});
  }
}
