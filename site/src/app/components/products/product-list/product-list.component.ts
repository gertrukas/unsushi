import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../../../services/products.service';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent implements OnInit{

  products: Product[] = [];
  item: string  = '';
  private currentPage: number = 1;
  isloading: boolean = false;

  constructor(private service: ProductsService) {
  }

  ngOnInit() {
    this.getData(1, this.item);
  }

  getData(page: number, item: any) {
    this.isloading = true;
    this.service.getProducts(page, item).subscribe(response => {
      for(let i=0;response.data.length>i;i++){
        this.products.push(response.data[i]);
      }
      this.isloading = false;
    }, error => {
      console.error(error);
      this.isloading = false;
    });
  }

}
