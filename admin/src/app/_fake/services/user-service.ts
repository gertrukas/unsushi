import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';
import { IRoleModel } from './role.service';
import { environment } from "../../../environments/environment";
import { AuthService } from "../../modules/auth";

export interface DataTablesResponse {
    draw?: number;
    recordsTotal: number;
    recordsFiltered: number;
    data: any[];
}

export interface IUserModel {
    avatar?: null | string;
    _id: string;
    name: string;
    email: string;
    password: string;
    confirmPassword?: string;
    pass?: null | string;
    active?: null | boolean;
    last_login_at?: null | string;
    last_login_ip?: null | string;
    profile_photo_path?: null | string;
    updated_at?: string;
    roles?: IRoleModel[];
    role?: string;
}

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private apiUrl = environment.apiUrl + '/users';
    auth:any;
    headers:any;

    constructor(private http: HttpClient,
                private authService: AuthService) {
      this.auth = this.authService.getAuthFromLocalStorage();
      this.headers = new HttpHeaders({
        'Authorization': 'Bearer ' + this.auth.authToken,
      });
    }

    getUsersLine(): Observable<any> {
      const url = `${this.apiUrl}/on-line`;
      return this.http.get<any>(url, {headers: this.headers});
    }

    getUsers(): Observable<DataTablesResponse> {
        const url = `${this.apiUrl}/all`;
        return this.http.post<DataTablesResponse>(url, {},{headers: this.headers});
    }

    getUser(id: string): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<IUserModel>(url, {headers: this.headers});
    }

    createUser(user: IUserModel): Observable<IUserModel> {
        return this.http.post<IUserModel>(`${this.apiUrl}/create`, user, {headers: this.headers});
    }

    activeUser(id: string): Observable<IUserModel> {
        const url = `${this.apiUrl}/active`;
        const params = {
          "id": id,
        }
        return this.http.post<IUserModel>(url, params, {headers: this.headers});
    }

    updateUser(id: string, user: IUserModel): Observable<IUserModel> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.put<IUserModel>(url, user, {headers: this.headers});
    }

    deleteUser(id: string): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, {headers: this.headers});
    }
}
