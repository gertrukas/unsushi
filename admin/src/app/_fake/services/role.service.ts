import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IPermissionModel } from './permission.service';
import { IUserModel } from './user-service';
import { environment } from "../../../environments/environment";
import { AuthService } from "../../modules/auth";

export interface DataTablesResponse {
  draw?: number;
  recordsTotal: number;
  recordsFiltered: number;
  data: any[];
}

export interface IRoleModel {
  _id: string;
  name: string;
  created_at?: string;
  updated_at?: string;
  permission: boolean;
  permissions: IPermissionModel[];
  users: IUserModel[];
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  // private apiUrl = 'https://preview.keenthemes.com/starterkit/metronic/laravel/api/v1/roles';
  private apiUrl = environment.apiUrl + '/roles';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });}

  getUsers(id: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}/users-all`;
    return this.http.post<DataTablesResponse>(url, { id }, {headers: this.headers});
  }

  getRoles(dataTablesParameters?: any): Observable<DataTablesResponse> {
    const url = `${this.apiUrl}/all`;
    return this.http.post<DataTablesResponse>(url, dataTablesParameters, {headers: this.headers});
  }

  getRole(id: string): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<IRoleModel>(url, {headers: this.headers});
  }

  createRole(user: IRoleModel): Observable<IRoleModel> {
    return this.http.post<IRoleModel>(`${this.apiUrl}/create`, user, {headers: this.headers});
  }

  updateRole(id: string, user: IRoleModel): Observable<IRoleModel> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<IRoleModel>(url, user, {headers: this.headers});
  }

  deleteRole(id: string): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, {headers: this.headers});
  }

  deleteUser(role_id: string, user_id: string): Observable<void> {
    const url = `${this.apiUrl}/${role_id}/users/${user_id}`;
    return this.http.delete<void>(url, {headers: this.headers});
  }
}
