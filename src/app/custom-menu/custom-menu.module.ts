import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CustomMenuRoutingModule } from './custom-menu-routing.module';
import { EmbedIFrameModule } from '../shared/components/embed-iframe/embed-iframe.module';
import { CustomMenuComponent } from './custom-menu.component';


@NgModule({
  declarations: [
    CustomMenuComponent
  ],
  imports: [
    CommonModule,
    CustomMenuRoutingModule,
    EmbedIFrameModule
  ]
})
export class CustomMenuModule { }
