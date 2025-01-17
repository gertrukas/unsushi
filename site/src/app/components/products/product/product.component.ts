import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { TranslationService } from '../../../services/translation.service';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrl: './product.component.css'
})
export class ProductComponent {

  constructor(private service: ProductsService, private cdr: ChangeDetectorRef, public translator: TranslationService){}

  @Input() slug: string = '';
  isLoading: boolean = false;
  language: string = 'es';
  product: Product = {
    _id: '',
    name: '',
    slug: '',
    description: '',
    intro: '',
    model: '',
    key: '',
    new: '',
    size: '',
    translations: [],
    categories: [],
    image: '',
    images: [],
    active: false,
    delete: false
  };

  

  completeFn = () => {
    this.isLoading = false;
    this.cdr.detectChanges();
  }; 


  ngOnInit(): void {
    this.language = this.translator.getCurrentLanguage();
    this.isLoading = true;
    this.getProduct(this.slug);
  }

  getProduct(slug: string){
    this.service.getProduct(slug, this.language).subscribe({
      next: (response) => {
          this.product = response.data;
      },
      error: (err) => {
          console.log(err);
          this.completeFn();
      },
      complete: this.completeFn
    });
  }

}
