import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  url = environment.apiUrl + '/suppliers';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }


  getSuppliers(dataTablesParams: any): Observable<any> {
    let params = new HttpParams()
      .set('draw', dataTablesParams.draw)
      .set('start', dataTablesParams.start)
      .set('length', dataTablesParams.length);

    // Agrega cualquier parámetro adicional que necesites
    if (dataTablesParams.search && dataTablesParams.search.value) {
      params = params.set('search[value]', dataTablesParams.search.value);
    }
    return this.http.get<any>(`${this.url}/data-table`, { params, headers: this.headers});
  }

  getSuppliersAll(){
    return this.http.get<any>(`${this.url}/all`, {headers: this.headers});
  }

  getSupplier(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  activeSupplier(id: string){
    return this.http.post<any>(`${this.url}/active`, {"id": id}, {headers: this.headers});
  }

  postSupplier(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putSupplier(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteSupplier(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }
}
