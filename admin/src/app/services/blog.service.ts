import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Blog } from "../interfaces/blog";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class BlogService {

  url = environment.apiUrl + '/blogs';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }


  getBlogs(dataTablesParams: any): Observable<any> {
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

  getBlogsAll(): Observable<any> {
    return this.http.get<any>(`${this.url}/all`, { headers: this.headers});
  }

  getBlog(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  activeBlog(id: string){
    return this.http.post<any>(`${this.url}/active`, {"id": id}, {headers: this.headers});
  }

  postBlog(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putBlog(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteImgGallery(id: string, img: string){
    return this.http.delete<any>(`${this.url}/gallery/${id}/${img}`, {headers: this.headers});
  }

  deleteBlog(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }
}
