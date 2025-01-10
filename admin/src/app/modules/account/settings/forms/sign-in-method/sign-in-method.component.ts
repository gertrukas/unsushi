import {ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { SweetAlertOptions } from "sweetalert2";
import { AuthService, UserType } from "../../../../auth";
import { AuthModel } from "../../../../auth/models/auth.model";
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-sign-in-method',
  templateUrl: './sign-in-method.component.html',
})
export class SignInMethodComponent implements OnInit, OnDestroy {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  passwordForm: FormGroup;
  emailForm: FormGroup;

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

  showChangeEmailForm: boolean = false;
  showChangePasswordForm: boolean = false;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;
  private unsubscribe: Subscription[] = [];

  constructor(private auth: AuthService, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.user$ = this.auth.currentUserSubject.subscribe(user => {
      this.user = user;
    });
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
    this.unsubscribe.push(loadingSubscr);
  }

  ngOnInit(): void {
    this.emailForm = this.fb.group({
      email: [
        this.user?.email,
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
    });
    this.passwordForm = this.fb.group({
      currentPassword: [
        'test123',
        Validators.compose([
          Validators.required
        ]),
      ],
      newPassword: [
        '',
        Validators.compose([
          Validators.required,
          Validators.minLength(8),
          this.containsValidPassword
        ]),
      ],
      confirmPassword: [
        '',
        Validators.compose([
          Validators.required
        ]),
      ]
    }, { validators: this.checkPasswords.bind(this) });
  }

  get f() {
    return this.passwordForm.controls;
  }
  get fm() {
    return this.emailForm.controls;
  }

  toggleEmailForm(show: boolean) {
    this.showChangeEmailForm = show;
  }

  saveEmail(event: Event) {
    event.preventDefault();
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: 'El email se cambio con éxito',
    };
    this.isLoading$.next(true);
    //@ts-ignore
    this.auth.changeEmail(this.user?._id, this.fm.email.value).subscribe(response => {
      // @ts-ignore
      this.user.email = response.success.user.email;
      this.isLoading$.next(false);
      this.showChangeEmailForm = false;
      this.showAlert(successAlert);
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      errorAlert.text = error.error.message;
      this.showAlert(errorAlert);
      this.isLoading$.next(false);
      this.showChangeEmailForm = false;
      this.cdr.detectChanges();
    });
  }

  togglePasswordForm(show: boolean) {
    this.showChangePasswordForm = show;
  }

  containsValidPassword(control: AbstractControl): { [key: string]: boolean } | null {
    const hasUpperCase = /[A-Z]/.test(control.value); // Verifica si hay al menos una letra mayúscula
    const hasNumber = /\d/.test(control.value); // Verifica si hay al menos un número
    const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(control.value); // Verifica si hay al menos un símbolo

    // if (!hasUpperCase) {
    //   return { noUpperCase: true }; // Si no hay mayúscula
    // }
    // if (!hasNumber) {
    //   return { noNumber: true }; // Si no hay número
    // }
    if (!hasSymbol || !hasNumber || !hasUpperCase) {
      return { noSymbol: true };
    }

    return null; // Si cumple todas las condiciones, retorna nulo (sin errores)
  }

  checkPasswords(group: FormGroup) {
    // @ts-ignore
    const newPassword = group.get('newPassword').value;
    // @ts-ignore
    const confirmPassword = group.get('confirmPassword').value;

    return newPassword === confirmPassword ? null : { notSame: true };
  }

  savePassword(event: Event) {
    event.preventDefault();
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: 'La contraseña se cambio con éxito',
    };
    this.isLoading$.next(true);
    let params = {
      current_password: this.f.currentPassword.value,
      new_password: this.f.newPassword.value,
    }
    //@ts-ignore
    this.auth.changePassword(this.user?._id, params).subscribe(response => {
      this.isLoading$.next(false);
      this.showChangePasswordForm = false;
      this.showAlert(successAlert);
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      errorAlert.text = error.error.message;
      this.showAlert(errorAlert);
      this.isLoading$.next(false);
      this.showChangePasswordForm = false;
      this.cdr.detectChanges();
    });
  }

  extractText(obj: any): string {
    var textArray: string[] = [];

    for (var key in obj) {
      if (typeof obj[key] === 'string') {
        // If the value is a string, add it to the 'textArray'
        textArray.push(obj[key]);
      } else if (typeof obj[key] === 'object') {
        // If the value is an object, recursively call the function and concatenate the results
        textArray = textArray.concat(this.extractText(obj[key]));
      }
    }

    // Use a Set to remove duplicates and convert back to an array
    var uniqueTextArray = Array.from(new Set(textArray));

    // Convert the uniqueTextArray to a single string with line breaks
    var text = uniqueTextArray.join('\n');

    return text;
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

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}
