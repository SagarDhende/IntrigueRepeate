import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { GenerativeAiRoutingModule } from './generative-ai.-routing.module';
import { GenerativeAiComponent } from './generative-ai.component';
import { PanelModule } from 'primeng/panel';
import { DropdownModule } from 'primeng/dropdown';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { DialogModule } from 'primeng/dialog';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { NgScrollbar } from 'ngx-scrollbar'
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { TableModule } from 'primeng/table';
import { NgxSpinnerModule } from 'ngx-spinner';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [GenerativeAiComponent],
  imports: [
    CommonModule,
    FormsModule,
    GenerativeAiRoutingModule,
    ReactiveFormsModule,
    PanelModule,
    VisNetworkModule,
    DropdownModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputTextModule,
    ButtonModule,
    InputTextareaModule,
    ErrorDialogModule,
    DialogModule,
    BreadcrumbModule,
    NgScrollbar,
    ConfirmDialogModule,
    ToastModule,
    TableModule,
    NgxSpinnerModule,
    MultiSelectModule
  ],
  providers:[
    MessageService,
    ConfirmationService
  ]
})
export class GenerativeAiModule { }
