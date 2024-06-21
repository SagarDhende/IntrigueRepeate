import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardContainterComponent } from './dashboard-containter.component';

import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { EmbedIFrameModule } from '../embed-iframe/embed-iframe.module';



@NgModule({
  declarations: [DashboardContainterComponent],
  imports: [
    CommonModule,
    ErrorDialogModule,
    EmbedIFrameModule
  ],
  exports:[DashboardContainterComponent],
})
export class DashboardContainterModule { }
