import { AfterViewInit, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUserModel, UserService } from 'src/app/_fake/services/user-service';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit, AfterViewInit {

  isCollapsed: boolean;

  user: IUserModel = { _id: '', name: '', email: '', role:'', password: '', confirmPassword: '' };

  constructor(
    private userService: UserService,
    private route: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = String(this.route.snapshot.paramMap.get('id'));
    this.userService.getUser(id).subscribe((res: IUserModel) => {
      this.user = res;
      this.changeDetectorRef.detectChanges();
    });
  }

  ngAfterViewInit(): void {
  }

}
