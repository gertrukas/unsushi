import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { Routing } from '../../routing';
import { LayoutComponent } from './layout.component';
import { ComponentsModule } from '../../../components/components.module';
import { HomeComponent } from '../../public/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    HomeComponent
  ],
  imports: [
    CommonModule,
    ComponentsModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class LayoutModule { }
