import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class QuotationService {

  url = environment.apiUrl + '/quotations';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }


  getQuotations(dataTablesParams: any): Observable<any> {
    let params = new HttpParams()
      .set('draw', dataTablesParams.draw)
      .set('start', dataTablesParams.start)
      .set('length', dataTablesParams.length);

    // Agrega cualquier parámetro adicional que necesites
    if (dataTablesParams.search && dataTablesParams.search.value) {
      params = params.set('search[value]', dataTablesParams.search.value);
    }
    return this.http.get<any>(`${this.url}/all`, { params, headers: this.headers});
  }

  getQuotation(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  printQuotation(id: string){
    return this.http.get<any>(`${this.url}/print/${id}`, {headers: this.headers});
  }

  activeQuotation(id: string){
    return this.http.post<any>(`${this.url}/active`, {"id": id}, {headers: this.headers});
  }

  postQuotation(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putQuotation(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteQuotation(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }
}
