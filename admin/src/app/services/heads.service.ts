import { Injectable } from '@angular/core';
import {environment} from "../../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {AuthService} from "../../modules/auth";

@Injectable({
  providedIn: 'root'
})
export class HeadsService {

  url = environment.apiUrl + '/heads';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }


  getHeads(){
    return this.http.get<any>(this.url, {headers: this.headers});
  }

  showHead(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  activeHead(params: any){
    return this.http.post<any>(`${this.url}/active`, params, {headers: this.headers});
  }

  postHead(params: any){
    return this.http.post<any>(this.url, params, {headers: this.headers});
  }

  putHead(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteHead(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }
}
