import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { DataTablesResponse, IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { SweetAlertOptions } from 'sweetalert2';
import {IPermissionModel, PermissionService} from "../../../_fake/services/permission.service";

@Component({
  selector: 'app-role-listing',
  templateUrl: './role-listing.component.html',
  styleUrls: ['./role-listing.component.scss']
})
export class RoleListingComponent implements OnInit, AfterViewInit, OnDestroy {

  isCollapsed1 = false;

  isLoading = false;

  roles$: Observable<DataTablesResponse>;

  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  role$: Observable<IRoleModel>;
  roleModel: IRoleModel = { _id: '', name: '', permission: false, permissions: [], users: [] };

  permissions: IPermissionModel[] = [];

  @ViewChild('formModal')
  formModal: TemplateRef<any>;

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  private clickListener: () => void;

  constructor(private apiService: RoleService, private permissionService: PermissionService, private cdr: ChangeDetectorRef, private renderer: Renderer2, private modalService: NgbModal) { }


  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id } = closestBtn.dataset;

        switch (action) {
          case 'view':
            break;

          case 'create':
            this.create();
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'active':
            this.active(id);
            break;

          case 'edit':
            this.edit(id);
            this.modalService.open(this.formModal, this.modalConfig);
            break;

          case 'delete':
            break;
        }
      }
    });
  }

  ngOnInit(): void {
    this.permissionService.getPermissionsAll().subscribe(response => {
      this.permissions = response.data;
    });
    this.roles$ = this.apiService.getRoles();
  }

  delete(id: string) {
    this.apiService.deleteRole(id).subscribe(() => {
    });
  }

  edit(id: string) {
    this.role$ = this.apiService.getRole(id);
    this.role$.subscribe((user: IRoleModel) => {
      this.roleModel = user;
    });
  }

  active(id: string) {
    this.role$ = this.apiService.getRole(id);
    this.role$.subscribe((user: IRoleModel) => {
      this.roleModel = user;
    });
  }

  create() {
    this.roleModel = { _id: '', name: '', permission: false, permissions: [], users: [] };
  }

  asign(id: string): void{
    if (this.roleModel.permissions.some(p => p._id === id)){
      const index  = this.roleModel.permissions.findIndex(p => p._id === id)
      this.roleModel.permissions.splice(index, 1);
    } else {
      const permission = this.permissions.find(p => p._id === id);
      // @ts-ignore
      this.roleModel.permissions.push(permission);
    }
  }

  viewCheck(id: string): boolean {
    return this.roleModel.permissions.some(p => p._id === id);
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: this.roleModel._id ? 'Rol actualizado correctamente' : 'Rol creado correctamente',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
      this.modalService.dismissAll();
      this.roles$ = this.apiService.getRoles();
      this.cdr.detectChanges();
    };

    const updateFn = () => {
      // @ts-ignore
      this.apiService.updateRole(this.roleModel._id, this.roleModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    const createFn = () => {
      this.apiService.createRole(this.roleModel).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.roleModel._id) {
      updateFn();
    } else {
      createFn();
    }
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

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener();
    }
    this.modalService.dismissAll();
  }
}
