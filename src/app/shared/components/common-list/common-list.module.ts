import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonListComponent } from './common-list.component';
import { TableListComponent } from './table-list/table-list.component';
import { SearchListComponent } from './search-list/search-list.component';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { NgxSpinnerModule } from 'ngx-spinner';
import { TabViewModule } from 'primeng/tabview';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SidebarModule } from 'primeng/sidebar';
import {NgScrollbar, NgScrollbarModule} from 'ngx-scrollbar'
import { PaginatorModule } from 'primeng/paginator';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FieldsetModule } from 'primeng/fieldset';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { SliderModule } from 'primeng/slider';
import {MultiSelectModule} from 'primeng/multiselect';
import { MenuModule } from 'primeng/menu';
import { ErrorDialogModule } from '../error-dialog/error-dialog.module';
import { TdBgColorDirective } from '../../directives/td-bg-color.directive';


@NgModule({
  declarations: [
    CommonListComponent,
    TableListComponent,
    SearchListComponent
  ],
  imports: [
    CommonModule,
    ErrorDialogModule  ,
    SidebarAccordionModule,
    MultiSelectModule,
    MenuModule,
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
    NgScrollbarModule,
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
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
   TableListComponent,
   SearchListComponent
  ],
  providers: [
    MessageService,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommonListModule { }
