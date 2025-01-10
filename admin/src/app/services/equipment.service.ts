import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EquipmentService {

  url = environment.apiUrl + '/equipments';
  urlpublic = environment.apiUrl;
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }

  getEquipments(dataTablesParams: any): Observable<any> {
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

  getEquipment(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  getEquipmentPDF(name: string){
    this.http.get(`${this.urlpublic}/public/equipment/pdf/${name}`, {headers: this.headers});
  }

  activeEquipment(id: string){
    return this.http.post<any>(`${this.url}/active`, {'id': id}, {headers: this.headers});
  }

  postEquipment(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putEquipment(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteEquipment(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }

}
