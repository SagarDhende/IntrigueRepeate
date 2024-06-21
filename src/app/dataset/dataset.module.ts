import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonListModule } from '../shared/components/common-list/common-list.module';
import { DatasetComponent } from './dataset.component';
import { DatasetListComponent } from './dataset-list/dataset-list.component';
import { DatasetRoutingModule } from './dataset-routing.module';
import { DatasetDetailsComponent } from './dataset-details/dataset-details.component';
import {  ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabViewModule } from 'primeng/tabview';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarModule } from 'primeng/sidebar';
import {NgScrollbar} from 'ngx-scrollbar'
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FieldsetModule } from 'primeng/fieldset';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { SliderModule } from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { TdBgColorDirective } from '../shared/directives/td-bg-color.directive';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { DownloadModule } from '../shared/components/download/download.module';

@NgModule({
  declarations: [
    DatasetComponent,
    DatasetListComponent,
    DatasetDetailsComponent

  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CommonListModule,
    DatasetRoutingModule,
    SidebarAccordionModule,
    MenuModule,
    ButtonModule,
    DownloadModule,
    TooltipModule,
    DialogModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ErrorDialogModule  ,
    MultiSelectModule,
    TdBgColorDirective,
    SliderModule,
    ChipsModule,
    ChipModule,
    FieldsetModule,
    InputTextareaModule,
    PaginatorModule,
    NgScrollbar,
    PanelModule,
    SidebarModule,
    NgbModule,
    ToastModule,
    TableModule,
    ConfirmDialogModule,
    TooltipModule,
    CheckboxModule,
    InputTextModule,
    DialogModule,
    TabViewModule,
    NgxSpinnerModule,
    CalendarModule,
    DropdownModule,
    RadioButtonModule,
    ToastModule,
    ReactiveFormsModule,
    BreadcrumbModule,
    InputGroupModule,
    InputGroupAddonModule,
    InputNumberModule
  ], 
  providers: [
    MessageService,
  ],
})
export class DatasetModule { }
