import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { DownloadComponent } from './download.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';


@NgModule({
  declarations: [
    DownloadComponent
  ],
  exports:[DownloadComponent],

  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    ErrorDialogModule,
    InputNumberModule,
    DropdownModule,
    DialogModule,
    ReactiveFormsModule
  ]
})
export class DownloadModule { }
