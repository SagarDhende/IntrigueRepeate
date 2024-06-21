import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { D3WorldBubbleComponent } from './d3-world-bubble.component';



@NgModule({
  declarations: [
    D3WorldBubbleComponent
  ],
  imports: [
    CommonModule
  ], exports: [D3WorldBubbleComponent]
})
export class D3WorldBubbleModule { }