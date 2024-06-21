import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3SankeyComponent } from './d3-sankey.component';
import { SliderModule } from 'primeng/slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    D3SankeyComponent
  ],
  imports: [
    CommonModule,
    SliderModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [D3SankeyComponent]
})
export class D3SankeyModule { }
