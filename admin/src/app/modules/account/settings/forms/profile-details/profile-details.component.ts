import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import {SwalComponent} from "@sweetalert2/ngx-sweetalert2";
import {SweetAlertOptions} from "sweetalert2";
import {AuthService, UserType} from "../../../../auth";
import {AuthModel} from "../../../../auth/models/auth.model";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {environment} from "../../../../../../environments/environment";

@Component({
  selector: 'app-profile-details',
  templateUrl: './profile-details.component.html',
})
export class ProfileDetailsComponent implements OnInit, OnDestroy {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  profileForm: FormGroup;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  user$: Subscription;
  user: UserType = {
    address: undefined,
    authToken: "",
    communication: {email: false, phone: false, sms: false},
    companyName: "",
    emailSettings: {
      activityRelatesEmail: {
        memberRegistration: false,
        newMembershipApproval: false,
        someoneAddsYouAsAsAConnection: false,
        uponNewOrder: false,
        youAreSentADirectMessage: false,
        youHaveNewNotifications: false
      }, emailNotification: false, sendCopyToPersonalEmail: false
    },
    expiresIn: undefined,
    firstname: "",
    language: "",
    lastname: "",
    occupation: "",
    phone: "",
    pic: "",
    refreshToken: "",
    roles: [],
    setAuth(auth: AuthModel): void {
    },
    setUser(_user: unknown): void {
    },
    socialNetworks: undefined,
    timeZone: "",
    website: "",
    _id: '',
    name: '',
    email: '',
    password: '',
    passwordNew: '',
    passwordNewRepeat: ''
  };

  avatar: string = 'url(./assets/media/avatars/300-1.jpg';
  image:any;
  url: string = environment.apiUrl;

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.user$ = this.auth.currentUserSubject.subscribe(user => {
      this.user = user;
      if (this.user && this.user.avatar) {
        this.avatar = `url(${this.url}${this.user.avatar})`;
      }
    });
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  get f() {
    return this.profileForm.controls;
  }

  ngOnInit(): void {
    let firstName: string = ''; // Asigna el primer nombre
    let lastName: string = '';
    if (this.user?.name) {
      const names = this.user.name.split(' ');

      firstName = names[0]; // Asigna el primer nombre
      lastName = names.slice(1).join(' ');
    }
    this.profileForm = this.fb.group({
      firstName: [
        firstName,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      lastName: [
        lastName,
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
      phone: [
        this.user?.phone,
        Validators.compose ( [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ])
      ]
    });
  }

  saveSettings() {
    const params = new FormData();
    params.append('first_name', this.f.firstName.value);
    params.append('last_name', this.f.lastName.value);
    params.append('phone', this.f.phone.value);
    if (this.image != undefined){
      params.append('file', this.image);
    }
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: 'La informacion se actualizo con éxito',
    };
    this.isLoading$.next(true);
    //@ts-ignore
    this.auth.updateUser(this.user?._id, params).subscribe( response  => {
      this.user = response.success.user;
      this.isLoading$.next(false);
      this.showAlert(successAlert);
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      errorAlert.text = error.error.message;
      this.showAlert(errorAlert);
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    });
  }

  showAlert(swalOptions: SweetAlertOptions) {
    let style = swalOptions.icon?.toString() || 'success';
    if (swalOptions.icon === 'error') {
      style = 'danger';
    }
    this.swalOptions = Object.assign({
      buttonsStyling: false,
      confirmButtonText: "Ok, ¡Lo tengo!",
      customClass: {
        confirmButton: "btn btn-" + style
      }
    }, swalOptions);
    this.cdr.detectChanges();
    this.noticeSwal.fire();
  }

  async getImage(e: any){
    let file = e.target.files[0];
    this.image = file;
    await this.uploadImage(file);
  }

  async uploadImage(file: any){
    let reader = new FileReader();
    reader.onload = (e) => {
      //@ts-ignore
      this.avatar = `url(${e.target.result})`;
      this.cdr.detectChanges();
    }

    reader.readAsDataURL(file);
    // this.image = await this.fileTobase64(file);
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
