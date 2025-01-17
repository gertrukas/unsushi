import { Routes } from '@angular/router';
import { HomeComponent } from './public/home/home.component';
import { ProductDetailsComponent } from './public/product-details/product-details.component';

const Routing: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'producto/:slug',
        component: ProductDetailsComponent
    },
    {
        path: 'product/:slug',
        component: ProductDetailsComponent
    }
];

export { Routing };