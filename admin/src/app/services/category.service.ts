import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  url = environment.apiUrl + '/categories';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }

  getCategories(dataTablesParams: any): Observable<any> {
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

  getCategoriesAll(): Observable<any> {
    return this.http.get<any>(`${this.url}/all`, { headers: this.headers});
  }

  getCategory(id: any){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  getCategoryChildren(id: any){
    return this.http.get<any>(`${this.url}/children/${id}`, {headers: this.headers});
  }

  activeCategory(id:any){
    return this.http.post<any>(`${this.url}/active`, {"id": id}, {headers: this.headers});
  }

  postCategory(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putCategory(id: any, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteCategory(id: any){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }

}
