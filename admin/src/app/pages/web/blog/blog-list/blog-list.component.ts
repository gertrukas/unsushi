import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTablesResponse } from "../../../../_fake/services/user-service";
import { Config } from "datatables.net";
import { Observable } from "rxjs";
import { SwalComponent } from "@sweetalert2/ngx-sweetalert2";
import { SweetAlertOptions } from "sweetalert2";
import { NgForm } from "@angular/forms";
import { Blog } from "../../../../interfaces/blog";
import { BlogService } from "../../../../services/blog.service";
import { CategoryService } from "../../../../services/category.service";
import { Category } from "../../../../interfaces/category";
import { FormControl } from '@angular/forms';
import hljs from 'highlight.js';
import { TranslationService } from '../../../../modules/i18n';
import { DatePipe } from '@angular/common';
import { environment } from 'src/environments/environment';

const API_URL = `${environment.apiUrl}`;

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss',
  providers: [ DatePipe ]
})
export class BlogListComponent implements OnInit, OnDestroy{

  isCollapsed1 = false;
  isCollapsed2 = true;

  isLoading = false;

  blogs: DataTablesResponse;

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
  aBlog: Observable<any>;
  blogModel: Blog = {
    _id: '',
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


  constructor(private apiService: BlogService, private datePipe: DatePipe, private apiServiceC: CategoryService, private cdr: ChangeDetectorRef, private translationService: TranslationService) { }

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
        this.apiService.getBlogs(dataTablesParameters).subscribe(resp => {
          let dataTotal = []
          for(let i = 0; i < resp.data.blogs.length; i++) {
            let blog = {
              _id: resp.data.blogs[i]._id,
              is_active: resp.data.blogs[i].is_active,
              created_at: resp.data.blogs[i].created_at,
              image: resp.data.blogs[i].image,
              details: [] as { _id: string, name: string; description: string; slug: string; intro: string } []
            }
            for (let e = 0; e < resp.data.translations.length; e++) {
              for (let o = 0; o < resp.data.translations[e].length; o++) {
                if (resp.data.blogs[i]._id === resp.data.translations[e][o].blog) {
                  const detail = {
                    _id: resp.data.translations[e][o]._id,
                    language: resp.data.translations[e][o].language,
                    name: resp.data.translations[e][o].name,
                    description: resp.data.translations[e][o].description,
                    slug: resp.data.translations[e][o].slug,
                    intro:resp.data.translations[e][o].intro,
                  }
                  blog.details.push(detail);
                }
              }
            }
            dataTotal.push(blog)
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
          title: 'Fecha', data: 'created_at', render: function (data) {
            const formattedDate = that.datePipe.transform(data, 'fullDate', '', that.language);
            return `<div class="badge badge-light fw-bold">${ formattedDate }</div>`;
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

  setCategories(select: any){
    const id_category = select.control.value;
    // @ts-ignore
    let category: Category = this.categories.find(category => category._id === id_category);
  }

  delete(id: string) {
    this.apiService.deleteBlog(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  edit(id: string) {
    this.aBlog = this.apiService.getBlog(id);
    this.aBlog.subscribe(resp => {
      console.log(resp);
      this.blogModel = resp;
      this.selectedCategories = resp.categories;
    });
  }

  active(id: string) {
    this.apiService.activeBlog(id).subscribe(() => {
      this.reloadEvent.emit(true);
    });
  }

  create() {
    this.blogModel = {
      _id: '',
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
    let item = this.blogModel.translations?.find(item => item.language === language);
  
    if (!item) {
      // Si no existe, crear uno nuevo
      item = {
        blog_id: this.blogModel._id,
        language: language,
        name: '',
        description: '',
        intro: ''
      };
      this.blogModel.translations?.push(item); // Agregar al arreglo
    }
    // Actualizar el objeto con las nuevas propiedades
    Object.assign(item, newProperties);
  }

  get setName(): string {
    const translation = this.blogModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.name;
    }
    return '';
  }

  set setName(newName: string){
    this.addOrUpdateItem(this.language, { name: newName });
  }

  get setDescription(): string {
    const translation = this.blogModel.translations?.find( trans => trans.language == this.language);
    if(translation){
      return translation.description;
    }
    return '';
  }

  set setDescription(newDescription: string){
    this.addOrUpdateItem(this.language, { description: newDescription });
  }

  get setIntro(): string {
    const translation = this.blogModel.translations?.find( trans => trans.language == this.language);
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
      text: this.blogModel._id ? 'Blog actualizado con éxito' : 'Blog creado con éxito',
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
      params.append('is_new', 'true');
      params.append('translations', JSON.stringify(this.blogModel.translations));
      for(let p=0;this.files.length>p;p++){
        params.append('images', this.files[p]);
      }
      if (this.image != undefined){
        params.append('file', this.image);
      }
      // @ts-ignore
      this.apiService.putBlog(this.blogModel._id, params).subscribe({
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
      params.append('translations', JSON.stringify(this.blogModel.translations));
      for(let p=0;this.files.length>p;p++){
        params.append('images', this.files[p]);
      }
      if (this.image != undefined){
        params.append('file', this.image);
      }
      this.apiService.postBlog(params).subscribe({
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

    if (this.blogModel._id) {
      updateFn();
    } else {
      createFn();
    }
    this.imageInit = '';
    this.thumbnail = '';
    this.image = '';
    this.blogModel = {
      _id: '',
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
      this.blogModel.image = e.target.result;
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
    this.apiService.deleteImgGallery(this.blogModel._id, img).subscribe(response => {
      this.edit(this.blogModel._id);
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
