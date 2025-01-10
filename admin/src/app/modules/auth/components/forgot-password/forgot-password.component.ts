import {ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl} from '@angular/forms';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { SweetAlertOptions } from "sweetalert2";
import { ActivatedRoute, Router } from '@angular/router';

enum ErrorStates {
  NotSubmitted,
  HasError,
  NoError,
}

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  btn: boolean = false;
  token: string;
  forgotPasswordForm: FormGroup;
  passwordForm: FormGroup;
  errorState: ErrorStates = ErrorStates.NotSubmitted;
  errorStates = ErrorStates;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  isLoading: boolean;

  // private fields
  private unsubscribe: Subscription[] = []; // Read more: => https://brianflove.com/2016/12/11/anguar-2-unsubscribe-observables/

  constructor(private fb: FormBuilder, private authService: AuthService, private cdr: ChangeDetectorRef, private activatedRoute: ActivatedRoute, private router: Router) {
    const loadingSubscr = this.isLoading$
      .asObservable()
      .subscribe((res) => (this.isLoading = res));
  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe(params => {
      this.token = params['token'];
    });
    this.initForm();
  }

  // convenience getter for easy access to form fields
  get f() {
    return this.forgotPasswordForm.controls;
  }

  get f2() {
    return this.passwordForm.controls;
  }

  initForm() {
    this.passwordForm = this.fb.group({
      password: [
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
    this.forgotPasswordForm = this.fb.group({
      email: [
        '',
        Validators.compose([
          Validators.required,
          Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
    });
  }

  submit() {
    this.isLoading$.next(true);
    this.errorState = ErrorStates.NotSubmitted;
    const forgotPasswordSubscr = this.authService
      .forgotPassword(this.f.email.value)
      .pipe(first())
      .subscribe((result: boolean) => {
        this.isLoading$.next(false);
        this.errorState = result ? ErrorStates.NoError : ErrorStates.HasError;
      });
    this.unsubscribe.push(forgotPasswordSubscr);
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
    const newPassword = group.get('password').value;
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
      password: this.f2.password.value,
      token: this.token,
    }
    this.authService.resetPassword(params).subscribe(response => {
      this.isLoading$.next(false);
      this.showAlert(successAlert);
      this.cdr.detectChanges();
      this.router.navigateByUrl('/auth/login');
    }, error => {
      console.error(error);
      errorAlert.text = error.error.message;
      this.showAlert(errorAlert);
      this.btn = true;
      this.isLoading$.next(false);
      this.cdr.detectChanges();
    });
  }

  forgotGo(){
    this.router.navigateByUrl('/auth/forgot-password');
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
}
