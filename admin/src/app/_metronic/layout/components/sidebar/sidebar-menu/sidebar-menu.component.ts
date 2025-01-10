import { Component, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import { AuthService, UserType } from "../../../../../modules/auth";
import { NgxPermissionsService } from 'ngx-permissions';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {

  user$: Observable<UserType>;

  constructor(private auth: AuthService) {
    this.user$ = this.auth.currentUserSubject.asObservable();
  }

  ngOnInit() {
  }

}
