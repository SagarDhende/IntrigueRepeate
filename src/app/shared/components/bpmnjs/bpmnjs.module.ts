import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BpmnjsComponent } from './bpmnjs.component';



@NgModule({
  declarations: [
    BpmnjsComponent
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    BpmnjsComponent
  ]
})
export class BpmnjsModule { }
