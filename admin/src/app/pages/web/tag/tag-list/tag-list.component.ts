import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTablesResponse } from "../../../../_fake/services/user-service";
import { Config } from "datatables.net";
import { Observable } from "rxjs";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { SweetAlertOptions } from "sweetalert2";
import { NgForm } from "@angular/forms";
import { Tag } from "../../../../interfaces/tag";
import { TagService } from "../../../../services/tag.service";
import { CategoryService } from "../../../../services/category.service";
import { Category } from "../../../../interfaces/category";
import { FormControl } from '@angular/forms';
import hljs from 'highlight.js';
import { TranslationService } from '../../../../modules/i18n';
import { environment } from 'src/environments/environment';

const API_URL = `${environment.apiUrl}`;

@Component({
  selector: 'app-tag-list',
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss'
})
export class TagListComponent implements OnInit, OnDestroy{

  isCollapsed1 = false;
  isCollapsed2 = true;

  isLoading = false;

  tags: DataTablesResponse;

  categories: Category[] = [];

  selectedCategories: Category[] = [];

  datatableConfig: Config = {};

  files: File[] = [];
  image:any;
  imageInit:any;
  thumbnail:any;

  // Reload emitter inside datatable
  reloadEvent: EventEmitter<boolean> = new EventEmitter();

  // Single model
  aTag: Observable<any>;
  tagModel: Tag = {
    _id: '',
    parent: '',
    categories: [],
    default_language: '',
    images: [],
    translations: [],
    image: ''
  };

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

  categoriesForm = new FormControl('');


  constructor(private apiService: TagService,  private apiServiceC: CategoryService, private cdr: ChangeDetectorRef, private translationService: TranslationService) { }

  ngAfterViewInit(): void {
  }

  ngOnInit(): void {
    this.language = this.translationService.getSelectedLanguage();
    const that = this;
    this.apiServiceC.getCategoriesAll().subscribe(response => {
      this.categories = response.data;
    }, error => {
      console.error(error);
    });
    this.datatableConfig = {
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        this.apiService.getTags(dataTablesParameters).subscribe(resp => {
          let dataTotal = []
          for(let i = 0; i < resp.data.tags.length; i++) {
            let tag = {
              _id: resp.data.tags[i]._id,
              parent: resp.data.tags[i].parent,
              is_active: resp.data.tags[i].is_active,
              categories: resp.data.tags[i].categories,
              image: resp.data.tags[i].image,
              details: [] as { _id: string, name: string; description: string; slug: string; intro: string } []
            }
            for (let e = 0; e < resp.data.translations.length; e++) {
              for (let o = 0; o < resp.data.translations[e].length; o++) {
                if (resp.data.tags[i]._id === resp.data.translations[e][o].tag) {
                  const detail = {
                    _id: resp.data.translations[e][o]._id,
                    language: resp.data.translations[e][o].language,
                    name: resp.data.translations[e][o].name,
                    description: resp.data.translations[e][o].description,
                    slug: resp.data.translations[e][o].slug,
                    intro:resp.data.translations[e][o].intro,
                  }
                  tag.details.push(detail);
                }
              }
            }
            dataTotal.push(tag)
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
            const imageCanvas = `
              <div class="d-flex flex-column aspect me-5" data-action="view" data-id="${full.id}">
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">
                <img src="${imageFull}" class="aspect cursor-pointer" [alt]="${full.name}"/>
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
                <a href="javascript:;" class="text-gray-800 text-hover-primary mb-1">${detail ? detail.name: ''}</a>
              </div>
            `;

            return nameAndEmail;
          }
        },
        {
          title: 'Categorias', data: 'categories', render: function (data) {
            const result = data.map((category: { translations: any[]; }) => {
              // Busca el detalle que coincida con el idioma que necesitas
              const detail = category.translations.find((item: { language: string; }) => item.language === that.language);
              // Si existe el detalle, muestra su nombre, de lo contrario, muestra un mensaje alternativo
              return `
                <div class="badge badge-light fw-bold">
                  ${detail ? detail.name : 'Sin nombre'}
                </div>
              `;
            }).join('');
            return result;
          }
        },
        {
          title: 'Parent', data: 'parent', render: function (data) {
            return `<div class="badge badge-light fw-bold">${ data }</div>`;
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

  // Método para agregar un nuevo categoria
  addCategory() {
    this.selectedCategories.push({_id: '', default_language: '', is_new: true, translations: [] }); // Agrega un nuevo campo vacío para el categoria
  }

  // Método para eliminar un categoria
  removeCategory(index: number) {
    this.selectedCategories.splice(index, 1); // Elimina el categoria en el índice especificado
  }

  // Método para manejar el cambio en la selección de categorias
  onCategoryChange(index: number, category_id: string) {
    const category = this.categories.find((item) => item._id == category_id);
    if (category) {
      this.selectedCategories[index] = category;
    }
    this.tagModel.categories = this.selectedCategories;
    console.log(this.tagModel.categories);
  }

  setCategories(select: any){
    const id_category = select.control.value;
    // @ts-ignore
    let category: Category = this.categories.find(category => category._id === id_category);
  }

  delete(id: string) {
    this.apiService.deleteTag(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: string) {
    this.aTag = this.apiService.getTag(id);
    this.aTag.subscribe(resp => {
      console.log(resp);
      this.tagModel = resp;
      this.selectedCategories = resp.categories;
    });
  }

  active(id: string) {
    this.apiService.activeTag(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  create() {
    this.tagModel = {
      _id: '',
      parent: '',
      categories: [],
      default_language: '',
      images: [],
      translations: [],
      image: ''
    };
    this.selectedCategories = [];
  }

  toogleLanguage(event: any){
    this.language = event;
    this.reloadEvent.emit(true);
  }

  toogleLanguageModal(event: any){
    this.language = event;
  }

  addOrUpdateItem(language: string, newProperties: any) {
    // Buscar el objeto por el slug
    let item = this.tagModel.translations?.find(item => item.language === language);
  
    if (!item) {
      // Si no existe, crear uno nuevo
      item = {
        tag_id: this.tagModel._id,
        language: language,
        name: '',
        description: '',
        intro: ''
      };
      this.tagModel.translations?.push(item); // Agregar al arreglo
    }
    // Actualizar el objeto con las nuevas propiedades
    Object.assign(item, newProperties);
  }

  get setName(): string {
    const translation = this.tagModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.name;
    }
    return '';
  }

  set setName(newName: string){
    this.addOrUpdateItem(this.language, { name: newName });
  }

  get setDescription(): string {
    const translation = this.tagModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.description;
    }
    return '';
  }

  set setDescription(newDescription: string){
    this.addOrUpdateItem(this.language, { description: newDescription });
  }

  get setIntro(): string {
    const translation = this.tagModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.intro;
    }
    return '';
  }

  set setIntro(newIntro: string){
    this.addOrUpdateItem(this.language, { intro: newIntro });
  }

  onSubmit(event: Event, myForm: NgForm) {
    if (myForm && myForm.invalid) {
      return;
    }

    this.isLoading = true;

    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: this.tagModel._id ? 'Etiqueta actualizado con éxito' : 'Etiqueta creado con éxito',
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
      params.append('parent', this.tagModel.parent);
      params.append('translations', JSON.stringify(this.tagModel.translations));
      this.tagModel.categories.forEach((category) => {
        params.append('categories[]', String(category._id)); // Utiliza 'categories[]' si es necesario para que el backend lo reconozca como un arreglo
      });
      for(let p=0;this.files.length>p;p++){
        params.append('images', this.files[p]);
      }
      if (this.image != undefined){
        params.append('file', this.image);
      }
      // @ts-ignore
      this.apiService.putTag(this.tagModel._id, params).subscribe({
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
      const params = new FormData();
      params.append('parent', this.tagModel.parent);
      params.append('translations', JSON.stringify(this.tagModel.translations));
      this.tagModel.categories.forEach((category) => {
        params.append('categories[]', String(category._id)); // Utiliza 'categories[]' si es necesario para que el backend lo reconozca como un arreglo
      });
      for(let p=0;this.files.length>p;p++){
        params.append('images', this.files[p]);
      }
      if (this.image != undefined){
        params.append('file', this.image);
      }
      this.apiService.postTag(params).subscribe({
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
      this.imageInit = '';
      this.thumbnail = '';
      this.image = '';
    };

    if (this.tagModel._id) {
      updateFn();
    } else {
      createFn();
    }
    this.imageInit = '';
    this.thumbnail = '';
    this.image = '';
    this.tagModel = {
      _id: '',
      parent: '',
      categories: [],
      default_language: '',
      images: [],
      translations: [],
      image: ''
    };
    this.clearDropZone();
  }

  onSelect(event: any) {
    this.files.push(...event.addedFiles);
    this.cdr.detectChanges();
  }

  onRemove(event: any) {
    this.files.splice(this.files.indexOf(event), 1);
    this.cdr.detectChanges();
  }

  clearDropZone(){
    this.files.splice(0);
    this.cdr.detectChanges();
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
      //@ts-ignore
      this.tagModel.image = e.target.result;
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

  deleteImageGallery(path: string){
    const img: string = path.split('/').pop() || '';
    this.isLoading = true;
    const successAlert: SweetAlertOptions = {
      icon: 'success',
      title: '¡Exito!',
      text: 'Imagen Eliminada con éxito',
    };
    const errorAlert: SweetAlertOptions = {
      icon: 'error',
      title: '¡Error!',
      text: '',
    };
    this.apiService.deleteImgGallery(this.tagModel._id, img).subscribe(response => {
      this.edit(this.tagModel._id);
      this.showAlert(successAlert);
      this.isLoading = false;
      this.cdr.detectChanges();
    }, error => {
      console.error(error);
      errorAlert.text = this.extractText(error.error);
      this.showAlert(errorAlert);
      this.isLoading = false;
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

  ngOnDestroy(): void {
    this.reloadEvent.unsubscribe();
  }

}
