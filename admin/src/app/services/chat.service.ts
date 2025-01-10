import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import {Observable} from "rxjs";
import {DataTablesResponse} from "../_fake/services/user-service";
import {AuthService} from "../modules/auth";
import {HttpClient, HttpHeaders} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private socket: Socket;
  private apiUrl = environment.apiUrl + '/chats';
  auth:any;
  headers:any;

  constructor(private http: HttpClient,
              private authService: AuthService) {
    this.auth = this.authService.getAuthFromLocalStorage();
    this.headers = new HttpHeaders({
      'Authorization': 'Bearer ' + this.auth.authToken,
    });
    if (!this.socket) {
      this.socket = io(environment.apiUrl, { transports: ['websocket'] });
    }
  }

  getSocket(): Socket {
    return this.socket;
  }

  getChats(): Observable<any> {
    const url = `${this.apiUrl}/chat-group`;
    return this.http.get<any>(url, {headers: this.headers});
  }

  getChatsPrivate(params: any): Observable<any> {
    const url = `${this.apiUrl}/chats-private`;
    return this.http.post<any>(url, params,{headers: this.headers});
  }
}
