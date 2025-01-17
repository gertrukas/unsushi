import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTablesResponse } from "../../../../_fake/services/user-service";
import { Config } from "datatables.net";
import { Observable } from "rxjs";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { SweetAlertOptions } from "sweetalert2";
import { NgForm } from "@angular/forms";
import { Category } from "../../../../interfaces/category";
import { CategoryService } from "../../../../services/category.service";
import hljs from 'highlight.js';
import { TranslationService } from 'src/app/modules/i18n';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit, OnDestroy {

  API_URL = `${environment.apiUrl}`;
  isCollapsed1 = false;
  isCollapsed2 = true;

  isLoading = false;

  image:any;
  imageInit:any;
  thumbnail:any;

  categories: DataTablesResponse;

  datatableConfig: Config = {};

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aCategory: Observable<any>;
  categoryModel: Category = {_id: '', default_language: '', is_new: true, translations: [] };

  public language: string = '';

  quillModules = {
    syntax: {
      hljs: hljs, // Usar la instancia de highlight.js aquí
    },
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  @ViewChild('noticeSwal')
  noticeSwal!: SwalComponent;

  swalOptions: SweetAlertOptions = {};


  constructor(private apiService: CategoryService,  private cdr: ChangeDetectorRef, private translationService: TranslationService) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.language = this.translationService.getSelectedLanguage();
    const that = this;
    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.apiService.getCategories(dataTablesParameters).subscribe(resp => {
          let dataTotal = []
          for(let i = 0; i < resp.data.categories.length; i++) {
            let category = {
              _id: resp.data.categories[i]._id,
              is_active: resp.data.categories[i].is_active,
              image: resp.data.categories[i].image,
              details: [] as { _id: string, name: string; description: string; slug: string; intro: string } []
            }
            for (let e = 0; e < resp.data.translations[i].length; e++) {
              if (resp.data.categories[i]._id === resp.data.translations[i][e].category) {
                const detail = {
                  _id: resp.data.translations[i][e]._id,
                  language: resp.data.translations[i][e].language,
                  name: resp.data.translations[i][e].name,
                  description: resp.data.translations[i][e].description,
                  slug: resp.data.translations[i][e].slug,
                  intro:resp.data.translations[i][e].intro,
                  section:resp.data.translations[i][e].section,
                }
                category.details.push(detail);
              }
            }
            dataTotal.push(category)
          }
          callback({
            data: dataTotal || [],
            recordsTotal: resp.recordsTotal || 0,
            recordsFiltered: resp.recordsFiltered || 0
          });
        });
      },
      columns: [
        {
          title: 'Imagen', data: 'image', render: function (data, type, full) {
            const imageFull = data;
            const defaultImage = 'assets/media/misc/image.png'; // Cambia esta ruta a la de tu imagen por defecto
            const detail = full.details.find((item: { language: string; }) => item.language == that.language);

            // Verificar si hay imagen
            const imageCanvas = data ? `
              <div class="d-flex flex-column aspect me-5" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">
                  <img src="${imageFull}" class="aspect cursor-pointer" alt="${detail && detail.name ? detail.name: ''}"/>
                </a>
              </div>
            ` : `
              <div class="d-flex flex-column aspect me-5" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">
                  <img src="${defaultImage}" class="aspect cursor-pointer" alt="Imagen por defecto"/>
                </a>
              </div>
            `;

            return imageCanvas;
          }
        },
        {
          title: 'Nombre', data: 'details', render: function (data, type, full) {
            const detail = data.find((item: { language: string; }) => item.language == that.language);
            const nameAndEmail = `
              <div class="d-flex flex-column" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${detail && detail.name ? detail.name: ''}</a>
              </div>
            `;

            return nameAndEmail;
          }
        },
        {
          title: 'Sección', data: 'details', render: function (data) {
            const detail = data.find((item: { language: string; }) => item.language == that.language);
            let result =  `<div class="badge badge-light fw-bold">${detail && detail.section ? detail.section: ''}</div>`;
            return result;
          }
        },
        {
          title: 'Status', data: 'is_active', render: function (data) {
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
  }

  delete(id: string) {
    this.apiService.deleteCategory(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: string) {
    console.log(id);
    this.aCategory = this.apiService.getCategory(id);
    this.aCategory.subscribe(resp => {
      this.categoryModel = resp.category;
      this.categoryModel.translations = resp.translations;
    });
  }

  active(id: string) {
    this.apiService.activeCategory(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  create() {
    this.categoryModel = { _id: '', default_language: 'es', is_new: true, translations: [] };
  }

  get setName(): string {
    const translation = this.categoryModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.name;
    }
    return '';
  }

  set setName(newName: string){
    this.addOrUpdateItem(this.language, { name: newName });
  }

  get setSection(): string {
    const translation = this.categoryModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.section;
    }
    return '';
  }

  set setSection(newSection: string){
    this.addOrUpdateItem(this.language, { section: newSection });
  }

  get setDescription(): string {
    const translation = this.categoryModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.description;
    }
    return '';
  }

  set setDescription(newDescription: string){
    this.addOrUpdateItem(this.language, { description: newDescription });
  }

  get setIntro(): string {
    const translation = this.categoryModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.intro;
    }
    return '';
  }

  set setIntro(newIntro: string){
    this.addOrUpdateItem(this.language, { intro: newIntro });
  }

  addOrUpdateItem(language: string, newProperties: any) {
    // Buscar el objeto por el slug
    let item = this.categoryModel.translations?.find(item => item.language === language);
  
    if (!item) {
      // Si no existe, crear uno nuevo
      item = {
        category_id: this.categoryModel._id,
        language: language,
        name: '',
        description: '',
        section: '',
        intro: ''
      };
      this.categoryModel.translations?.push(item); // Agregar al arreglo
    }
    // Actualizar el objeto con las nuevas propiedades
    Object.assign(item, newProperties);
  }

  toogleLanguage(event: any){
    this.language = event;
    this.reloadEvent.emit(true);
  }

  toogleLanguageModal(event: any){
    this.language = event;
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: this.categoryModel._id ? 'Categoria actualizado con éxito' : 'Categoria creado con éxito',
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
      const params = new FormData();
      params.append('translations', JSON.stringify(this.categoryModel.translations));
      if (this.image != undefined){
        params.append('file', this.image);
      }
      this.apiService.putCategory(this.categoryModel._id, params).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          console.error(error);
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    const createFn = () => {
      const params = new FormData();
      params.append('is_new', 'true');
      params.append('translations', JSON.stringify(this.categoryModel.translations));
      if (this.image != undefined){
        params.append('file', this.image);
      }
      this.apiService.postCategory(params).subscribe({
        next: () => {
          this.showAlert(successAlert);
          this.reloadEvent.emit(true);
        },
        error: (error) => {
          console.error(error);
          errorAlert.text = this.extractText(error.error);
          this.showAlert(errorAlert);
          this.isLoading = false;
        },
        complete: completeFn,
      });
    };

    if (this.categoryModel._id) {
      updateFn();
    } else {
      createFn();
    }

    this.imageInit = '';
    this.thumbnail = '';
    this.image = '';
    this.create();
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
      this.thumbnail = e.target.result;
      this.cdr.detectChanges();
    }

    reader.readAsDataURL(file);
    // this.image = await this.fileTobase64(file);
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
