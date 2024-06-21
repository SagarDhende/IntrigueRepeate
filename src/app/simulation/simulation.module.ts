import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PanelModule } from 'primeng/panel';
import { MessageService } from 'primeng/api';
import { SidebarAccordionModule } from 'ng-sidebar-accordion';
import { SimulationRoutingModule } from './simulation-routing.module';
import { SimulationComponent } from './simulation.component';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DropdownModule } from 'primeng/dropdown';
import { ErrorDialogModule } from '../shared/components/error-dialog/error-dialog.module';
import { VisNetworkModule } from '../shared/components/charts/vis-network/vis-network.module';
import { CommonListModule } from '../shared/components/common-list/common-list.module';
import { SimulationDetailsComponent } from './simulation-details/simulation-details.component';
import { SimulationListComponent } from './simulation-list/simulation-list.component';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { MenuModule } from 'primeng/menu';

@NgModule({
  declarations: [
    SimulationComponent,
    SimulationListComponent,
    SimulationDetailsComponent,
  ],
  imports: [
    SidebarAccordionModule,
    TableModule,
    CommonListModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PanelModule,
    RadioButtonModule,
    DropdownModule,
    VisNetworkModule,
    SimulationRoutingModule,
    ErrorDialogModule  ,
    VisNetworkModule,
    CheckboxModule,
    DialogModule,
    ConfirmDialogModule,
    InputTextModule,
    NgbModule,
    MenuModule
  ],
  providers: [
    MessageService,
  ]
 
})
export class SimulationModule { }
