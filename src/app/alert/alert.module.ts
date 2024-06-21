import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { AlertRoutingModule } from './alert-routing.module';
import { AlertComponent } from './alert.component';
import { AlertDetailsComponent } from './alert-details/alert-details.component';
import { AlertListComponent } from './alert-list/alert-list.component';
// PrimeNg
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FieldsetModule } from 'primeng/fieldset';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TreeTableModule } from 'primeng/treetable';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { DropdownModule } from 'primeng/dropdown';
import { SidebarModule } from 'primeng/sidebar';
import { SidebarAccordionModule } from 'ng-sidebar-accordion'
import { CalendarModule } from 'primeng/calendar';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TdBgColorDirective } from '../shared/directives/td-bg-color.directive';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { D3SankeyModule } from '../shared/components/charts/d3/d3-sankey/d3-sankey.module';
import { NgScrollbar } from 'ngx-scrollbar';
import { AlertService } from './alert.service';
import { CommonService } from '../shared/services/common.service';
import { HelperService } from '../shared/services/helper.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { BpmnjsModule } from '../shared/components/bpmnjs/bpmnjs.module';
import { MainPipeModule } from '../shared/components/main-pipe/pipes/main-pipe.module';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { NgxDicomModule } from '../shared/components/image-viewer/ngx-dicom/ngx-dicom.module';
import { BreadcrumbModule } from 'primeng/breadcrumb';


@NgModule({
  declarations:
   [
    AlertComponent,
    AlertDetailsComponent,
    AlertListComponent
  ],
  imports: [
    TdBgColorDirective,
    CommonModule,
    AlertRoutingModule,
    PanelModule,
    TableModule,
    PaginatorModule,
    CheckboxModule,
    TabViewModule,
    InputTextareaModule,
    FieldsetModule,
    TooltipModule,
    InputTextModule,
    ToastModule,
    TreeTableModule,
    DialogModule,
    OverlayPanelModule,
    SliderModule,
    MultiSelectModule,
    MenuModule,
    DropdownModule,
    ReactiveFormsModule,
    SidebarModule,
    SidebarAccordionModule,
    CalendarModule,
    NgbModule,
    NgxSpinnerModule,
    VisNetworkModule,
    D3SankeyModule,
    NgScrollbar,
    ConfirmDialogModule,
    BpmnjsModule,
    MainPipeModule,
    ErrorDialogModule,
    NgxDicomModule,
    BreadcrumbModule

  ],
  providers:[
    MessageService,
    AlertService,
    CommonService,
    HelperService,
    ConfirmationService
  ]
})
export class AlertModule { }
