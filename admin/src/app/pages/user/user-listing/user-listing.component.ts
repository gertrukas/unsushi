import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { Observable } from 'rxjs';
import { DataTablesResponse, IUserModel, UserService } from 'src/app/_fake/services/user-service';
import { SweetAlertOptions } from 'sweetalert2';
import moment from 'moment';
import { IRoleModel, RoleService } from 'src/app/_fake/services/role.service';
import { Config } from 'datatables.net';

@Component({
  selector: 'app-user-listing',
  templateUrl: './user-listing.component.html',
  styleUrls: ['./user-listing.component.scss']
})
export class UserListingComponent implements OnInit, AfterViewInit, OnDestroy {

  isCollapsed1 = false;
  isCollapsed2 = true;

  isLoading = false;

  users: DataTablesResponse;

  datatableConfig: Config = {};

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aUser: Observable<IUserModel>;
  userModel: IUserModel = { _id: '', name: '', email: '', role: '' };

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};

  roles$: Observable<DataTablesResponse>;

  constructor(private apiService: UserService, private roleService: RoleService, private cdr: ChangeDetectorRef) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.apiService.getUsers().subscribe(resp => {
          callback({
            data: resp.data || [],
            recordsTotal: resp.recordsTotal || 0,
            recordsFiltered: resp.recordsFiltered || 0
          });
        });
      },
      columns: [
        {
          title: 'Nombre', data: 'name', render: function (data, type, full) {
            const colorClasses = ['success', 'info', 'warning', 'danger'];
            const randomColorClass = colorClasses[Math.floor(Math.random() * colorClasses.length)];

            const initials = data[0].toUpperCase();
            const symbolLabel = `
              <div class="symbol-label fs-3 bg-light-${randomColorClass} text-${randomColorClass}">
                ${initials}
              </div>
            `;

            const nameAndEmail = `
              <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${data}</a>
                <span>${full.email}</span>
              </div>
            `;

            return `
              <div class="symbol symbol-circle symbol-50px overflow-hidden me-3" data-action="view" data-id="${full.id}">
                <a href="javascript:;">
                  ${symbolLabel}
                </a>
              </div>
              ${nameAndEmail}
            `;
          }
        },
        {
          title: 'Rol', data: 'role', render: function (data, type, row) {
            const roleName = row.roles[0]?.name;
            return roleName || '';
          },
          orderData: [1],
          orderSequence: ['asc', 'desc'],
          type: 'string',
        },
        {
          title: 'Ultimo login', data: 'last_login_at', render: (data, type, full) => {
            const date = data || full.created_at;
            const dateString = moment(date).fromNow();
            return `<div class="badge badge-light fw-bold">${dateString}</div>`;
          }
        },
        {
          title: 'Fecha creación', data: 'created_at', render: function (data) {
            return moment(data).format('DD MMM YYYY, hh:mm a');
          }
        },
        {
          title: 'Status', data: 'active', render: function (data) {
            let result = ''
            if(data){
              result = `<div class="badge badge-success fw-bold">Activo</div>`;
            } else {
              result = `<div class="badge badge-danger fw-bold">Inactivo</div>`;
            }
            return result;
          }
        }
      ],
      createdRow: function (row, data, dataIndex) {
        $('td:eq(0)', row).addClass('d-flex align-items-center');
      },
    };

    this.roles$ = this.roleService.getRoles();
  }

  delete(id: string) {
    this.apiService.deleteUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: string) {
    this.aUser = this.apiService.getUser(id);
    this.aUser.subscribe((user: IUserModel) => {
      this.userModel = user;
    });
  }

  active(id: string) {
    this.apiService.activeUser(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  create() {
    this.userModel = { _id: '', name: '', email: '', };
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: this.userModel._id ? 'Usuario actualizado con éxito' : 'Usuario creado con éxito',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };

    const completeFn = () => {
      this.isLoading = false;
    };

    const updateFn = () => {
      // @ts-ignore
      this.apiService.updateUser(this.userModel._id, this.userModel).subscribe({
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
      this.userModel.password = 'test123';
      this.apiService.createUser(this.userModel).subscribe({
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

    if (this.userModel._id) {
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
    this.reloadEvent.unsubscribe();
  }
}
