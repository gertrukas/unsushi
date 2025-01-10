import {ChangeDetectorRef, Component, ViewChild} from '@angular/core';
import { UserService } from "../../../../../_fake/services/user-service";
import { AuthService, UserType } from "../../../../auth";
import { Subscription } from "rxjs";
import { SweetAlertOptions } from "sweetalert2";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";

@Component({
  selector: 'app-deactivate-account',
  templateUrl: './deactivate-account.component.html',
})
export class DeactivateAccountComponent {

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  user$: Subscription;
  user: UserType;
  isLoading = false;

  constructor(private userService: UserService, private auth: AuthService, private cdr: ChangeDetectorRef) {
    this.user$ = this.auth.currentUserSubject.subscribe(user => {
      this.user = user;
    });
  }

  deleteAcount(){
    this.deleteSwal.fire().then((clicked) => {
      if (clicked.isConfirmed) {
        this.successSwal.fire();
      }
    });
  }

  saveSettings() {
    this.isLoading = true;
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: 'Se elimino con éxito',
    };
    // @ts-ignore
    this.userService.deleteUser(this.user._id).subscribe( {
      next: ( response ) => {
        this.showAlert(errorAlert);
        this.isLoading = false;
        this.auth.logout();
      }, error: (error) => {
      errorAlert.text = this.extractText(error.error);
      this.showAlert(errorAlert);
      this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
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

}
