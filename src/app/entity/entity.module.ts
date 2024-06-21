import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EntityRoutingModule } from './entity-routing.module';
import { EntityComponent } from './entity.component';
import { EntityListComponent } from './entity-list/entity-list.component';
import { EntityDetailComponent } from './entity-detail/entity-detail.component';
import { TableModule } from 'primeng/table';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { ToastModule } from 'primeng/toast';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { FieldsComponent } from './fields/fields.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SliderModule } from 'primeng/slider';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { NgScrollbar } from 'ngx-scrollbar'
import { NgScrollbarModule } from 'ngx-scrollbar';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { InputTextModule } from 'primeng/inputtext';

@NgModule({
  declarations: [EntityComponent,EntityListComponent,EntityDetailComponent,FieldsComponent],
  imports: [
    VisNetworkModule,
    CommonModule,
    EntityRoutingModule,
    TableModule,
    SidebarAccordionModule,
    TabViewModule,
    PanelModule,
    ToastModule,
    NgxSpinnerModule,
    NgbNavModule,
    ButtonModule,
    MenuModule,
    MultiSelectModule,
    PaginatorModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    SliderModule,
    RadioButtonModule,
    CheckboxModule,
    CalendarModule,
    NgScrollbarModule,
    NgScrollbar,
    ErrorDialogModule,
    InputTextModule
  ]
})
export class EntityModule { }
