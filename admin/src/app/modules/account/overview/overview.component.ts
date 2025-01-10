import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs";
import {AuthService, UserType} from "../../auth";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
})
export class OverviewComponent implements OnInit {

  user$: Observable<UserType>;
  url = environment.apiUrl;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.currentUserSubject.asObservable();
  }

  ngOnInit(): void {}
}
