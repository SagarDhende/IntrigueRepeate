import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportComponent } from './report.component';
import { ReportRoutingModule } from './report-routing.module';
import { ReportCardComponent } from './report-card/report-card.component';
import { ReportDetailsComponent } from './report-details/report-details.component';
import {  ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { DialogModule } from 'primeng/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { PanelModule } from 'primeng/panel';
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
import { MessageService } from 'primeng/api';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CommonListModule } from '../shared/components/common-list/common-list.module';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ReportArchiveComponent } from './report-archive/report-archive.component';
import { DownloadModule } from '../shared/components/download/download.module';

@NgModule({
  declarations: [
    ReportComponent,
    ReportCardComponent,
    ReportDetailsComponent,
    ReportArchiveComponent
  ],
  imports: [
    CommonModule,
    ReportRoutingModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule,
    MenuModule,
    ButtonModule,
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
    SidebarAccordionModule,
    NgbModule,
    ToastModule,
    TableModule,
    ConfirmDialogModule,
    TooltipModule,
    CheckboxModule,
    DialogModule,
    TabViewModule,
    NgxSpinnerModule,
    CalendarModule,
    DropdownModule,
    RadioButtonModule,
    ToastModule,
    SelectButtonModule,
    BreadcrumbModule,
    CommonListModule,
    DownloadModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    MessageService,
  ],
})
export class ReportModule { }
