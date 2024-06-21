import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardEmbedContainerRoutingModule } from './dashboard-embed-container-routing.module';
import { DashboardEmbedContainerComponent } from './dashboard-embed-container.component';
import { EmbedIFrameModule } from '../embed-iframe/embed-iframe.module';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';


@NgModule({
  declarations: [
    DashboardEmbedContainerComponent
  ],
  imports: [
    CommonModule,
    EmbedIFrameModule,
    DashboardEmbedContainerRoutingModule,
    ErrorDialogModule
  ],
  exports: [DashboardEmbedContainerComponent]
})
export class DashboardEmbedContainerModule { }
