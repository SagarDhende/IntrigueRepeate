import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

/* Components */
import { CaseRoutingModule } from './case-routing.module';
import { CaseComponent } from './case.component';
import { CaseDetailsComponent } from './case-details/case-details.component';
import { CaseListComponent } from './case-list/case-list.component';
import { CreateCaseComponent } from './create-case/create-case.component';

/* Services */
import { CommonService } from 'src/app/shared/services/common.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { AppConfigService } from 'src/app/app-config.service';
import { CaseService } from './case.service';
import { HelperService } from 'src/app/shared/services/helper.service';
import { NgxSpinnerService } from 'ngx-spinner';

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
import { SliderModule } from 'primeng/slider';
import { MultiSelectModule } from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { SidebarModule } from 'primeng/sidebar';
import { PanelModule } from 'primeng/panel';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ConfirmationService, MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuItem } from 'primeng/api';


/* Directives */
import { TdBgColorDirective } from '../shared/directives/td-bg-color.directive';

/* Libraries */
import { NgbDatepickerModule, NgbDropdownModule,  } from '@ng-bootstrap/ng-bootstrap';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgScrollbar } from 'ngx-scrollbar'
import { NgScrollbarModule } from 'ngx-scrollbar';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { NgxSpinnerModule } from 'ngx-spinner';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { D3SankeyModule } from '../shared/components/charts/d3/d3-sankey/d3-sankey.module';
import { BpmnjsModule } from '../shared/components/bpmnjs/bpmnjs.module';
import { ErrorModule } from '../demo/components/auth/error/error.module';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MainPipeModule } from '../shared/components/main-pipe/pipes/main-pipe.module';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';


@NgModule({
  declarations: [
    CaseComponent,
    CaseListComponent,
    CaseDetailsComponent,
    CreateCaseComponent
  ],
  imports: [
    CommonModule,
    CaseRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    PaginatorModule,
    CheckboxModule,
    TableModule,
    TabViewModule,
    InputTextareaModule,
    FieldsetModule,
    TooltipModule,
    InputTextModule,
    SelectButtonModule,
    ToastModule,
    DialogModule,
    OverlayPanelModule,
    ChipModule,
    ChipsModule,
    SliderModule,
    ToggleButtonModule,
    ButtonModule,
    MultiSelectModule,
    CalendarModule,
    DropdownModule,
    SidebarModule,
    PanelModule,
    FileUploadModule,
    MenuModule,
    NgScrollbar,
    NgScrollbarModule,
    SidebarAccordionModule,
    NgbDatepickerModule,
    NgbDropdownModule,
    NgbModule,
    NgxSpinnerModule,
    TdBgColorDirective,
    VisNetworkModule,
    D3SankeyModule,
    BpmnjsModule,
    ErrorModule,
    ConfirmDialogModule,
    MainPipeModule,
    ErrorDialogModule
  ],
  providers: [
    MessageService,
    CommonService,
    SessionService,
    AppConfigService,
    CaseService,
    HelperService,
    NgxSpinnerService,
    ConfirmationService
  ]
})

export class CaseModule { }

