import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {AuthService, UserType} from "../auth";
import {environment} from "../../../environments/environment";

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
})
export class AccountComponent implements OnInit {

  user$: Observable<UserType>;
  url = environment.apiUrl;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.currentUserSubject.asObservable();
  }

  ngOnInit(): void {}
}
