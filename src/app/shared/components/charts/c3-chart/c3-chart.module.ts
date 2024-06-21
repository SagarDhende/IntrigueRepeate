import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { C3ChartComponent } from './c3-chart.component';



@NgModule({
  declarations: [
    C3ChartComponent
  ],
  imports: [
    CommonModule
  ],
  exports:[C3ChartComponent]
})
export class C3ChartModule { }
