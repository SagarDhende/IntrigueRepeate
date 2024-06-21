import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorDialogComponent } from './error-dialog.component';
import { DialogModule } from 'primeng/dialog';
import { KeyFilterModule } from 'primeng/keyfilter';
import { MessagesModule } from 'primeng/messages';

@NgModule({
  declarations: [
    ErrorDialogComponent
  ],
  imports: [
    CommonModule,
    DialogModule,
    MessagesModule,
    MessagesModule,
    KeyFilterModule
  ],
  exports: [
    ErrorDialogComponent,
    MessagesModule,
    KeyFilterModule
  ]
})
export class ErrorDialogModule { }
