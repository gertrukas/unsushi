import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

const API_URL = `${environment.apiUrl}/public/products`;
const ADMIN_URL = `${environment.adminUrl}`;

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private http: HttpClient) {}


  getProducts(start: number, search_value: string){
    return this.http.post<any>(`${API_URL}`, {start, search_value});
  }

  getProduct(slug: string){
    return this.http.get<any>(`${API_URL}/${slug}`);
  }
}
