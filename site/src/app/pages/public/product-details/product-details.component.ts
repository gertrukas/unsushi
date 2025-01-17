import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../interfaces/product';
import { TranslationService } from '../../../services/translation.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute, private cdr: ChangeDetectorRef){}

  slug: string = '';

  

  completeFn = () => {
    this.cdr.detectChanges();
  }; 


  ngOnInit(): void {
    this.activatedRoute.params.subscribe({
      next: (params) => {
          this.slug = params['slug'];
      },
      error: (err) => {
          console.log(err);
          this.completeFn();
      },
      complete: this.completeFn
    });
  }

}
