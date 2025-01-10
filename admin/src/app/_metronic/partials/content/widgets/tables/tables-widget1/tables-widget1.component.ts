import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Product } from "../../../../../../interfaces/product";
import { ProductService } from "../../../../../../services/product.service";
import { Item } from "../../../../../../interfaces/quotation";

@Component({
  selector: 'app-tables-widget1',
  templateUrl: './tables-widget1.component.html',
})
export class TablesWidget1Component implements OnInit {

  @Input() item: string = '';
  @Output() addItemFather: EventEmitter<Item> = new EventEmitter();

  isLoading = false;

  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.isLoading = true;
    // this.productService.getSearchProducts(this.item).subscribe( (response: { products: Product[] }) => {
    //   this.products = response.products;
    //   this.isLoading = false;
    // });
  }

  addItem(product: Product) {
    // this.productService.getExchangeRates().subscribe( response => {
    //   const rateToMXN: number = response.exchange_rates.rateToMXN;
    //   const item: Item = {
    //     product_id: product,          // ID del artículo
    //     observation: '',
    //     quantity: 1,                  // Cantidad del artículo temporal
    //     delivery_time: '',
    //     quantity_tmp: 1,                // Cantidad del artículo temporal
    //     price: product.price * rateToMXN,        // Precio por unidad del artículo
    //     total: product.price * rateToMXN
    //   }
    //   this.addItemFather.emit(item);
    // });
  }

}
