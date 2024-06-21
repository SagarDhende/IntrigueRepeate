import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { NgxSpinnerModule } from 'ngx-spinner';


import { DataTableComponent } from './data-table.component';
import {ToggleButtonModule} from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { TdBgColorDirective } from '../../directives/td-bg-color.directive';



@NgModule({
  declarations: [
    DataTableComponent
  ],
  exports:[DataTableComponent],

  imports: [
    CommonModule,
    TableModule,
    NgxSpinnerModule,
    ToggleButtonModule,
    ButtonModule,
    FormsModule,
    ErrorDialogModule,
    TdBgColorDirective
  ]
})
export class DataTableModule { }
