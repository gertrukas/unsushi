import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';
import { DataTableDirective } from 'angular-datatables';
import { fromEvent } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';
import { SweetAlertOptions } from 'sweetalert2';
import { Api, Config } from 'datatables.net';
import { NgxPermissionsService } from "ngx-permissions";

@Component({
  selector: 'app-crud',
  templateUrl: './crud.component.html',
  styleUrls: ['./crud.component.scss'],
})
export class CrudComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input() datatableConfig: Config = {};

  @Input() route: string = '/';
  @Input() module: string = 'entradas';

  // Reload emitter inside datatable
  @Input() reload: EventEmitter<boolean>;

  @Input() modal: TemplateRef<any>;

  @Output() deleteEvent = new EventEmitter<string>();
  @Output() editEvent = new EventEmitter<string>();
  @Output() createEvent = new EventEmitter<boolean>();
  @Output() activeEvent = new EventEmitter<string>();
  @Output() viewEvent = new EventEmitter<string>();
  @Output() printEvent = new EventEmitter<string>();

  dtOptions: Config = {};

  @ViewChild(DataTableDirective, { static: false })
  private datatableElement: DataTableDirective;

  @ViewChild('deleteSwal')
  public readonly deleteSwal!: SwalComponent;

  @ViewChild('successSwal')
  public readonly successSwal!: SwalComponent;

  private idInAction: string;

  modalConfig: NgbModalOptions = {
    modalDialogClass: 'modal-dialog modal-dialog-centered mw-650px',
  };

  swalOptions: SweetAlertOptions = { buttonsStyling: false };

  private modalRef: NgbModalRef;

  private clickListener: () => void;

  hasEditPermission: boolean = false;
  hasDeletePermission: boolean = false;

  constructor(private renderer: Renderer2, private permissionsService: NgxPermissionsService, private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.permissionsService.permissions$.subscribe(permissions => {
      this.hasEditPermission = !!(permissions['full_access'] || permissions['edit_web'] || permissions['edit_warehouse'] || permissions['edit_sales']);
      this.hasDeletePermission = !!(permissions['full_access'] || permissions['delete_web'] || permissions['delete_warehouse'] || permissions['delete_sales']);
    });
    this.dtOptions = {
      dom: "<'row'<'col-sm-12'tr>>" +
        "<'d-flex justify-content-between'<'col-sm-12 col-md-5'i><'d-flex justify-content-between'p>>",
      processing: true,
      language: {
        processing: '<span class="spinner-border spinner-border-sm align-middle"></span> Cargando...',
        lengthMenu: 'Mostrar _MENU_ ' + this.module,
        zeroRecords: 'No se encontraron ' + this.module,
        info: 'Mostrando _START_ a _END_ de _TOTAL_ ' + this.module,
        infoEmpty: 'Mostrando 0 a 0 de 0 ' + this.module,
        infoFiltered: '(filtrado de _MAX_ ' + this.module + ' totales)',
        paginate: {
          first: 'Primera',
          last: 'Última',
          next: 'Siguiente',
          previous: 'Anterior'
        }
      },
      pageLength: 10, // Número de elementos por página
      lengthMenu: [10, 25, 50, 100],
      ...this.datatableConfig
    };
    this.renderActionColumn();

    this.setupSweetAlert();

    if (this.reload) {
      this.reload.subscribe(data => {
        this.modalService.dismissAll();
        this.datatableElement.dtInstance
          .then((dtInstance: Api) => {
            // @ts-ignore
            dtInstance.ajax.reload(null, false); // false para mantener la página actual
          })
          .catch(err => console.error('Error al recargar DataTable:', err)); // Añade control de errores aquí
      });
    }
  }

  renderActionColumn(): void {
    const actionColumn = {
      sortable: false,
      title: 'Acciones',
      render: (data: any, type: any, full: any) => {
        const viewButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px me-3" data-action="view" data-id="${full._id}">
            <i class="ki-duotone ki-eye fs-3">
              <span class="path1"></span>
              <span class="path2"></span>
              <span class="path3"></span>
            </i>
          </button>`;
        const printButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px" data-action="print" data-id="${full._id}">
            <i class="ki-duotone ki-printer fs-3">
              <span class="path1"></span>
              <span class="path2"></span>
              <span class="path3"></span>
              <span class="path4"></span>
            </i>
          </button>`;
        const activeButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px" data-action="active" data-id="${full._id}">
            <i class="ki-duotone ki-toggle-on-circle fs-3">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
          </button>`;

        const editButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px" data-action="edit" data-id="${full._id}">
            <i class="ki-duotone ki-pencil fs-3">
              <span class="path1"></span>
              <span class="path2"></span>
            </i>
          </button>`;

        const deleteButton = `
          <button class="btn btn-icon btn-active-light-primary w-30px h-30px" data-action="delete" data-id="${full._id}">
            <i class="ki-duotone ki-trash fs-3">
              <span class="path1"></span>
              <span class="path2"></span>
              <span class="path3"></span>
              <span class="path4"></span>
              <span class="path5"></span>
            </i>
          </button>`;

        const buttons = [];

        if (this.activeEvent.observed) {
          if (this.hasEditPermission) {
            if (this.module != "Cotizaciones") {
              buttons.push(activeButton);
            }
          }
        }

        if (this.activeEvent.observed) {
          if (this.module == "Cotizaciones") {
            buttons.push(printButton);
          }
        }

        if (this.activeEvent.observed) {
          if (this.module == "Cotizaciones") {
            buttons.push(viewButton);
          }
        }

        if (this.editEvent.observed) {
          if (this.hasEditPermission) {
            buttons.push(editButton);
          }
        }

        if (this.deleteEvent.observed) {
          if (this.hasDeletePermission) {
            buttons.push(deleteButton);
          }
        }

        return buttons.join('');
      },
    };

    if (this.dtOptions.columns) {
      this.dtOptions.columns.push(actionColumn);
    }
  }

  ngAfterViewInit(): void {
    this.clickListener = this.renderer.listen(document, 'click', (event) => {
      const closestBtn = event.target.closest('.btn');
      if (closestBtn) {
        const { action, id } = closestBtn.dataset;
        this.idInAction = id;

        switch (action) {
          case 'view':
            this.viewEvent.emit(this.idInAction);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            // this.router.navigate([`${this.route}/${id}`]);
            break;

          case 'print':
            this.printEvent.emit(this.idInAction);
            break;

          case 'create':
            this.createEvent.emit(true);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'active':
            this.activeEvent.emit(this.idInAction);
            break;

          case 'edit':
            this.editEvent.emit(this.idInAction);
            this.modalRef = this.modalService.open(this.modal, this.modalConfig);
            break;

          case 'delete':
            this.deleteSwal.fire().then((clicked) => {
              if (clicked.isConfirmed) {
                this.successSwal.fire();
              }
            });
            break;
        }
      }
    });

    this.triggerFilter();
  }

  ngOnDestroy(): void {
    this.reload.unsubscribe();
    if (this.clickListener) {
      this.clickListener();
    }
    this.modalService.dismissAll();
  }

  triggerDelete() {
    this.deleteEvent.emit(this.idInAction);
  }

  triggerFilter() {
    fromEvent<KeyboardEvent>(document, 'keyup')
      .pipe(
        debounceTime(50),
        map(event => {
          const target = event.target as HTMLElement;
          const action = target.getAttribute('data-action');
          const value = (target as HTMLInputElement).value?.trim().toLowerCase();

          return { action, value };
        })
      )
      .subscribe(({ action, value }) => {
        if (action === 'filter') {
          this.datatableElement.dtInstance.then((dtInstance: Api) => dtInstance.search(value).draw());
        }
      });
  }

  setupSweetAlert() {
    this.swalOptions = {
      buttonsStyling: false,
    };
  }
}
