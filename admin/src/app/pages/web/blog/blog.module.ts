import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { CrudModule } from "../../../modules/crud/crud.module";
import { SharedModule } from "../../../_metronic/shared/shared.module";
import { NgbCollapseModule, NgbDropdownModule, NgbNavModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { BlogListComponent } from "./blog-list/blog-list.component";
import { ImagePipe } from "../../../pipes/image.pipe";
import { NgxPermissionsModule } from "ngx-permissions";
import { QuillConfigModule } from 'ngx-quill/config';
import { QuillModule } from 'ngx-quill';
import { ComponentsModule } from 'src/app/components/components.module';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';



@NgModule({
  declarations: [ BlogListComponent ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule.forChild([
            {
                path: '',
                component: BlogListComponent
            }
        ]),
        CrudModule,
        SharedModule,
        NgbNavModule,
        ImagePipe,
        NgbDropdownModule,
        NgbCollapseModule,
        NgbTooltipModule,
        SweetAlert2Module.forChild(),
        FormsModule,
        CommonModule,
        NgxPermissionsModule,
        QuillConfigModule.forRoot({
            modules: {
                syntax: true,
                toolbar: [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],
            
                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction
            
                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],
            
                ['clean'],                                         // remove formatting button
            
                ['link', 'image', 'video']                         // link and image, video
                ]
            }
        }),
        QuillModule.forRoot(),
        ComponentsModule,
        NgxDropzoneModule,
        MatFormFieldModule, 
        MatSelectModule
    ]
})
export class BlogModule { }
