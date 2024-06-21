import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EchartComponent } from './echart.component';



@NgModule({
  declarations: [EchartComponent],
  imports: [
    CommonModule
  ],
  exports: [EchartComponent]
})
export class EchartModule { }