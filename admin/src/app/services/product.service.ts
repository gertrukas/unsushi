import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { AuthService } from "../modules/auth";
import { Product } from "../interfaces/product";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  url = environment.apiUrl + '/products';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
  }


  getProducts(dataTablesParams: any): Observable<any> {
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

  getProductsAll(): Observable<any> {
    return this.http.get<any>(`${this.url}/all`, { headers: this.headers});
  }

  getProductsAndServices(): Observable<any> {
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
    return this.http.get<any>(`${this.url}/products-services`, { headers: this.headers});
  }

  getSearchProducts(item: string){
    return this.http.post<any>(`${this.url}/search`, { item },{headers: this.headers});
  }

  getExchangeRates(){
    return this.http.get<any>(`${this.url}/exchange-rates`, {headers: this.headers});
  }

  buyProducts(params: Product[]){
    return this.http.post<any>(`${this.url}/buy-products`, {params}, {headers: this.headers});
  }

  buyProduct(params: Product){
    return this.http.post<any>(`${this.url}/buy-product`, params, {headers: this.headers});
  }

  getProduct(id: string){
    return this.http.get<any>(`${this.url}/${id}`, {headers: this.headers});
  }

  activeProduct(id: string){
    return this.http.post<any>(`${this.url}/active`, {"id": id}, {headers: this.headers});
  }

  postProduct(params: any){
    return this.http.post<any>(`${this.url}/create`, params, {headers: this.headers});
  }

  putProduct(id: string, params: any){
    return this.http.put<any>(`${this.url}/${id}`, params, {headers: this.headers});
  }

  deleteImgGallery(id: string, img: string){
    return this.http.delete<any>(`${this.url}/gallery/${id}/${img}`, {headers: this.headers});
  }

  deleteProduct(id: string){
    return this.http.delete<any>(`${this.url}/${id}`, {headers: this.headers});
  }
}
