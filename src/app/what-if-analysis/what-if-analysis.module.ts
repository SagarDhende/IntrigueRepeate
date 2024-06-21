import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WhatIfAnalysisRoutingModule } from './what-if-analysis-routing.module';
import { WhatIfAnalysisComponent } from './what-if-analysis.component';

/* Primeng */
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { MultiSelectModule } from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ConfirmationService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { C3ChartModule } from '../shared/components/charts/c3-chart/c3-chart.module';
import { TdBgColorDirective } from '../shared/directives/td-bg-color.directive'; 
import { DataTableModule } from '../shared/components/data-table/data-table.module';
import { SliderModule } from 'primeng/slider';
import { NgScrollbar } from 'ngx-scrollbar';



@NgModule({

  declarations: [
    WhatIfAnalysisComponent
  ],

  imports: [
    CommonModule,
    DataTableModule,
    WhatIfAnalysisRoutingModule,
    ConfirmDialogModule,
    FormsModule,
    ReactiveFormsModule,
    PaginatorModule,
    CheckboxModule,
    NgScrollbar,
    TableModule,
    TabViewModule,
    InputTextareaModule,
    FieldsetModule,
    TooltipModule,
    InputTextModule,
    SelectButtonModule,
    ToastModule,
    NgxSpinnerModule,
    DialogModule,
    SliderModule,
    OverlayPanelModule,
    ChipModule,
    ChipsModule,
    ToggleButtonModule,
    ButtonModule,
    MultiSelectModule,
    RadioButtonModule,
    CalendarModule,
    DropdownModule,
    SidebarModule,
    PanelModule,
    C3ChartModule,
    FileUploadModule,
    MenuModule,
    NgxSliderModule,
    TdBgColorDirective
  ],
providers:[ConfirmationService]
})
export class WhatIfAnalysisModule { }
