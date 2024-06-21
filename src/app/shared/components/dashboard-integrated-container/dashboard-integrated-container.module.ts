import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DashboardIntegratedContainerRoutingModule } from './dashboard-integrated-container-routing.module';
import { DashboardIntegratedContainerComponent } from './dashboard-integrated-container.component';
import { EchartModule } from '../charts/echart/echart.module';
// import { NgbDatepickerModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { PanelModule } from 'primeng/panel';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSpinnerModule } from 'ngx-spinner';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
// import { BreadcrumbModule } from 'src/app/theme/shared/components';
import { WhatIfAnalysisRoutingModule } from 'src/app/what-if-analysis/what-if-analysis-routing.module';
// import { DataDownloadModule } from '../data-download/data-download.module';
import { DataTableModule } from '../data-table/data-table.module';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { MenuModule } from 'primeng/menu';
import { DragDropModule } from '@angular/cdk/drag-drop';
// import { ArrayToKeyValuePipe } from './arrowToKeyValue.pipe';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { SidebarModule } from 'primeng/sidebar';
import { VisNetworkModule } from '../charts/vis-network/vis-network.module';
import { DividerModule } from 'primeng/divider';
import { D3SankeyModule } from '../charts/d3/d3-sankey/d3-sankey.module';
// import { D3WorldBubbleModule } from '../charts/d3/d3-world-bubble/d3-world-bubble.module';
import { NgScrollbar } from 'ngx-scrollbar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [DashboardIntegratedContainerComponent],
  imports: [
    CommonModule,
    DashboardIntegratedContainerRoutingModule,
    EchartModule,
    PanelModule,
    DialogModule,
    InputTextModule,
    TableModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CheckboxModule,
    TooltipModule,
    ConfirmDialogModule,
    NgxSpinnerModule,
    ErrorDialogModule,
    TabViewModule,
    OverlayPanelModule,
    NgxSliderModule,
    RadioButtonModule,
    WhatIfAnalysisRoutingModule,
    DataTableModule,
    MultiSelectModule,
    MenuModule,
    DragDropModule,
    SidebarModule,
    SidebarAccordionModule,
    VisNetworkModule,
    DividerModule,
    D3SankeyModule, 
    // D3WorldBubbleModule,
    NgScrollbar,
    NgbModule,
    ButtonModule
    // NgbDatepickerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [
    DashboardIntegratedContainerComponent,
    // ArrayToKeyValuePipe
  ]
})
export class DashboardIntegratedContainerModule { }
