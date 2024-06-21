import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmbedIframeRoutingModule } from './embed-iframe-routing.module';
import { EmbedIframeComponent } from './embed-iframe.component';
import { NgxSpinnerModule } from 'ngx-spinner';


@NgModule({
  declarations: [
    EmbedIframeComponent
  ],
  imports: [
    CommonModule,
    EmbedIframeRoutingModule,
    NgxSpinnerModule
  ],
  exports: [EmbedIframeComponent]
})
export class EmbedIFrameModule { }
