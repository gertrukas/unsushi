import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChoiceLanguageComponent } from './choice-language/choice-language.component';



@NgModule({
  declarations: [
    ChoiceLanguageComponent
  ],
  exports: [
    ChoiceLanguageComponent
  ],
  imports: [
    CommonModule
  ]
})
export class ComponentsModule { }
